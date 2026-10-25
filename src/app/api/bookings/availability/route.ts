import { db } from "@/lib/db";
import { dateWeekday } from "../route";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date || !DATE_RE.test(date)) {
    return Response.json({ error: "Informe uma data válida (yyyy-MM-dd)." }, { status: 400 });
  }

  const block = await db.dayBlock.findUnique({ where: { date } });
  if (block) {
    return Response.json({ occupied: [], closed: false, blocked: true, reason: block.reason ?? undefined });
  }

  const wh = await db.workHours.findUnique({ where: { weekday: dateWeekday(date) } });
  if (!wh || !wh.open) {
    return Response.json({ occupied: [], closed: true, blocked: false });
  }

  const bookings = await db.booking.findMany({
    where: { date, status: { not: "CANCELADO" } },
    select: { time: true },
  });

  return Response.json({
    occupied: bookings.map((b) => b.time),
    closed: false,
    blocked: false,
    from: wh.from,
    to: wh.to,
  });
}
