import { db } from "@/lib/db";
import { getSession, isAdmin, unauthorized } from "@/lib/auth";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function dateWeekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface SlotValidation {
  ok: boolean;
  status: number;
  error?: string;
}

/** Validates date/time against work hours, blocks, past dates and occupied slots. */
export async function validateSlot(date: string, time: string, ignoreBookingId?: string): Promise<SlotValidation> {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return { ok: false, status: 400, error: "Data ou horário inválido." };
  }
  if (date < todayISO()) {
    return { ok: false, status: 400, error: "Não é possível agendar em datas passadas." };
  }

  const block = await db.dayBlock.findUnique({ where: { date } });
  if (block) {
    return { ok: false, status: 409, error: "Esta data está bloqueada pelo studio." };
  }

  const wh = await db.workHours.findUnique({ where: { weekday: dateWeekday(date) } });
  if (!wh || !wh.open) {
    return { ok: false, status: 409, error: "O studio está fechado neste dia da semana." };
  }
  if (time < wh.from || time >= wh.to) {
    return { ok: false, status: 409, error: `Horário fora do expediente (${wh.from}–${wh.to}).` };
  }

  const occupied = await db.booking.findFirst({
    where: { date, time, status: { not: "CANCELADO" }, ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}) },
  });
  if (occupied) {
    return { ok: false, status: 409, error: "Este horário já está ocupado" };
  }

  return { ok: true, status: 200 };
}

export async function GET(req: Request) {
  const admin = await isAdmin();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!admin) {
    // Non-admins may only query occupied slots for a specific date
    const date = searchParams.get("date");
    if (!date) return Response.json({ error: "Informe a data." }, { status: 400 });
    const bookings = await db.booking.findMany({
      where: { date, status: { not: "CANCELADO" } },
      select: { time: true },
    });
    return Response.json({ occupied: bookings.map((b) => b.time) });
  }

  const bookings = await db.booking.findMany({
    where: {
      ...(from ? { date: { gte: from } } : {}),
      ...(to ? { date: { lte: to } } : {}),
    },
    include: { service: { select: { name: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return Response.json(
    bookings.map((b) => ({
      id: b.id,
      serviceId: b.serviceId,
      serviceName: b.service.name,
      date: b.date,
      time: b.time,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { serviceId, date, time, clientName, clientPhone } = body as Record<string, string>;

  if (!serviceId || !date || !time || !clientName?.trim() || !clientPhone?.trim()) {
    return Response.json({ error: "Preencha todos os dados do agendamento." }, { status: 400 });
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return Response.json({ error: "Serviço não encontrado ou indisponível." }, { status: 404 });
  }

  const check = await validateSlot(date, time);
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  const session = await getSession();
  const booking = await db.booking.create({
    data: {
      serviceId,
      date,
      time,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      userId: session?.userId ?? null,
      status: "PENDENTE",
    },
  });
  return Response.json(
    {
      id: booking.id,
      serviceId: booking.serviceId,
      serviceName: service.name,
      date: booking.date,
      time: booking.time,
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
