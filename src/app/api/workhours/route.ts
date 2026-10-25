import { db } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  const rows = await db.workHours.findMany({ orderBy: { weekday: "asc" } });
  const result: Record<number, { open: boolean; from: string; to: string }> = {};
  for (let i = 0; i < 7; i++) {
    const row = rows.find((r) => r.weekday === i);
    result[i] = row ? { open: row.open, from: row.from, to: row.to } : { open: false, from: "09:00", to: "18:00" };
  }
  return Response.json(result);
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  // Accept either { weekday, open, from, to } for one day or a full map {0:..,6:..}
  const entries: Array<{ weekday: number; open: boolean; from: string; to: string }> = [];
  if (typeof body.weekday === "number") {
    entries.push({ weekday: body.weekday, open: !!body.open, from: body.from ?? "09:00", to: body.to ?? "18:00" });
  } else {
    for (let i = 0; i < 7; i++) {
      const h = body[String(i)] ?? body[i];
      if (h) entries.push({ weekday: i, open: !!h.open, from: h.from ?? "09:00", to: h.to ?? "18:00" });
    }
  }
  for (const e of entries) {
    await db.workHours.upsert({
      where: { weekday: e.weekday },
      update: { open: e.open, from: e.from, to: e.to },
      create: e,
    });
  }
  return Response.json({ ok: true });
}
