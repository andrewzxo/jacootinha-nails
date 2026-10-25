import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";

const parseList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).filter((s) => s.trim()) : [];

const toClient = (c: any) => ({
  ...c,
  benefits: JSON.parse(c.benefits || "[]"),
  learnTheory: JSON.parse(c.learnTheory || "[]"),
  learnPractice: JSON.parse(c.learnPractice || "[]"),
  included: JSON.parse(c.included || "[]"),
  forWho: JSON.parse(c.forWho || "[]"),
  createdAt: c.createdAt?.toISOString(),
  updatedAt: c.updatedAt?.toISOString(),
});

export async function GET() {
  const admin = await isAdmin();
  const courses = await db.course.findMany({
    where: admin ? {} : { active: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(courses.map(toClient));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.name?.trim()) return Response.json({ error: "Nome é obrigatório." }, { status: 400 });
  const course = await db.course.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      duration: body.duration?.trim() || "Presencial",
      level: body.level?.trim() || "Iniciante",
      benefits: JSON.stringify(parseList(body.benefits)),
      learnTheory: JSON.stringify(parseList(body.learnTheory)),
      learnPractice: JSON.stringify(parseList(body.learnPractice)),
      included: JSON.stringify(parseList(body.included)),
      forWho: JSON.stringify(parseList(body.forWho)),
      note: body.note?.trim() ?? "",
      priceLabel: body.priceLabel ?? "Preço em breve",
      priceFull: body.priceFull ?? "",
      priceInstallments: body.priceInstallments ?? "",
      paymentNote: body.paymentNote ?? "",
      image: body.image ?? "/images/curso/capa.png",
      imagePosition: body.imagePosition ?? "center",
      active: body.active ?? true,
    },
  });
  return Response.json(toClient(course), { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.description !== undefined) data.description = body.description;
  if (body.duration !== undefined) data.duration = body.duration;
  if (body.level !== undefined) data.level = body.level;
  if (body.benefits !== undefined) data.benefits = JSON.stringify(parseList(body.benefits));
  if (body.learnTheory !== undefined) data.learnTheory = JSON.stringify(parseList(body.learnTheory));
  if (body.learnPractice !== undefined) data.learnPractice = JSON.stringify(parseList(body.learnPractice));
  if (body.included !== undefined) data.included = JSON.stringify(parseList(body.included));
  if (body.forWho !== undefined) data.forWho = JSON.stringify(parseList(body.forWho));
  if (body.note !== undefined) data.note = body.note;
  if (body.priceLabel !== undefined) data.priceLabel = body.priceLabel;
  if (body.priceFull !== undefined) data.priceFull = body.priceFull;
  if (body.priceInstallments !== undefined) data.priceInstallments = body.priceInstallments;
  if (body.paymentNote !== undefined) data.paymentNote = body.paymentNote;
  if (body.image !== undefined) data.image = body.image;
  if (body.imagePosition !== undefined) data.imagePosition = body.imagePosition;
  if (body.active !== undefined) data.active = body.active;
  const course = await db.course.update({ where: { id: body.id }, data });
  return Response.json(toClient(course));
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  await db.course.delete({ where: { id } });
  return Response.json({ ok: true });
}
