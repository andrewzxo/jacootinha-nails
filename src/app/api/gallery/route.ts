import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";

// Public GET returns active images ordered; admin gets all (via ?all=1)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("all") === "1" && (await isAdmin());
  const images = await db.galleryImage.findMany({
    where: admin ? {} : { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(images);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.url?.trim()) return Response.json({ error: "URL da imagem é obrigatória." }, { status: 400 });
  const image = await db.galleryImage.create({
    data: {
      url: body.url.trim(),
      caption: body.caption?.trim() || null,
      order: typeof body.order === "number" ? body.order : 99,
      imagePosition: body.imagePosition ?? "center",
      active: body.active ?? true,
    },
  });
  return Response.json(image, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.url !== undefined) data.url = body.url.trim();
  if (body.caption !== undefined) data.caption = body.caption?.trim() || null;
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  if (body.imagePosition !== undefined) data.imagePosition = body.imagePosition;
  if (body.active !== undefined) data.active = body.active;
  const image = await db.galleryImage.update({ where: { id: body.id }, data });
  return Response.json(image);
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  await db.galleryImage.delete({ where: { id } });
  return Response.json({ ok: true });
}
