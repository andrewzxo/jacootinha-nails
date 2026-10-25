import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  // Public: clients need block dates to disable days in the booking calendar
  const blocks = await db.dayBlock.findMany({ orderBy: { date: "asc" } });
  return Response.json(blocks);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.date || !DATE_RE.test(body.date)) {
    return Response.json({ error: "Informe uma data válida (yyyy-MM-dd)." }, { status: 400 });
  }
  const exists = await db.dayBlock.findUnique({ where: { date: body.date } });
  if (exists) return Response.json({ error: "Este dia já está bloqueado." }, { status: 409 });
  const block = await db.dayBlock.create({
    data: { date: body.date, reason: body.reason?.trim() || null },
  });
  return Response.json(block, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID obrigatório." }, { status: 400 });
  await db.dayBlock.delete({ where: { id } });
  return Response.json({ ok: true });
}
