import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";
import { validateSlot } from "../route";

const STATUSES = ["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"];

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const existing = await db.booking.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Agendamento não encontrado." }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return Response.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.date !== undefined || body.time !== undefined) {
    const date = body.date ?? existing.date;
    const time = body.time ?? existing.time;
    const check = await validateSlot(date, time, id);
    if (!check.ok) return Response.json({ error: check.error }, { status: check.status });
    data.date = date;
    data.time = time;
  }

  const updated = await db.booking.update({ where: { id }, data });
  return Response.json({ ...updated, createdAt: updated.createdAt.toISOString() });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const existing = await db.booking.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Agendamento não encontrado." }, { status: 404 });
  await db.booking.update({ where: { id }, data: { status: "CANCELADO" } });
  return Response.json({ ok: true });
}
