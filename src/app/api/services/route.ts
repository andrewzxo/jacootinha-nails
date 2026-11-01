import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";

const toClient = (s: any) => ({ ...s, createdAt: s.createdAt?.toISOString(), updatedAt: s.updatedAt?.toISOString() });

export async function GET() {
  const admin = await isAdmin();
  const services = await db.service.findMany({
    where: admin ? {} : { active: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(services.map(toClient));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.name?.trim() || body.price == null) {
    return Response.json({ error: "Nome e preço são obrigatórios." }, { status: 400 });
  }
  const service = await db.service.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      durationMin: Number(body.durationMin) || 60,
      price: body.price === null ? null : Number(body.price),
      image: body.image ?? "/images/gallery1.webp",
      imagePosition: body.imagePosition ?? "center",
      active: body.active ?? true,
    },
  });
  return Response.json(toClient(service), { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.description !== undefined) data.description = body.description;
  if (body.durationMin !== undefined) data.durationMin = Number(body.durationMin);
  if (body.price !== undefined) data.price = body.price === null ? null : Number(body.price);
  if (body.image !== undefined) data.image = body.image;
  if (body.imagePosition !== undefined) data.imagePosition = body.imagePosition;
  if (body.active !== undefined) data.active = body.active;
  const service = await db.service.update({ where: { id: body.id }, data });
  return Response.json(toClient(service));
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  const inUse = await db.booking.count({ where: { serviceId: id, status: { not: "CANCELADO" } } });
  if (inUse > 0) {
    await db.service.update({ where: { id }, data: { active: false } });
    return Response.json({ ok: true, softDeleted: true, message: "Serviço possui agendamentos; foi desativado." });
  }
  await db.service.delete({ where: { id } });
  return Response.json({ ok: true });
}
