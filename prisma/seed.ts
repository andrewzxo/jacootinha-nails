/* Idempotent seed: run with `bun prisma/seed.ts` */
import { scryptSync, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function futureISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  // Admin user (rebranded: Jacootinha Nails). Migrate old studio admin row if present.
  const newAdminEmail = "admin@jacootinha.com";
  const oldAdmin = await db.user.findUnique({ where: { email: "admin@studio.com" } });
  const existingAdmin = await db.user.findUnique({ where: { email: newAdminEmail } });
  if (existingAdmin) {
    await db.user.update({ where: { email: newAdminEmail }, data: { name: "Jacootinha", passwordHash: hashPassword("admin123"), role: "ADMIN" } });
    if (oldAdmin && oldAdmin.id !== existingAdmin.id) {
      await db.user.delete({ where: { id: oldAdmin.id } }).catch(() => {});
    }
  } else if (oldAdmin) {
    await db.user.update({ where: { email: "admin@studio.com" }, data: { name: "Jacootinha", email: newAdminEmail, passwordHash: hashPassword("admin123") } });
  } else {
    await db.user.create({
      data: { name: "Jacootinha", email: newAdminEmail, passwordHash: hashPassword("admin123"), role: "ADMIN" },
    });
  }
  console.log("Seeded admin user:", newAdminEmail);

  // Services (6)
  const services = [
    { name: "Manicure Clássica", description: "Cutilagem delicada, lixamento e esmaltação impecável com acabamento profissional.", durationMin: 60, price: 45, image: "/images/gallery1.webp" },
    { name: "Pedicure Spa", description: "Relaxante ritual com hidratação profunda, esfoliação e esmaltação perfeita.", durationMin: 75, price: 65, image: "/images/gallery2.webp" },
    { name: "Alongamento em Gel", description: "Unhas longas e naturais com gel de alta durabilidade, moldadas sob medida.", durationMin: 120, price: 180, image: "/images/gallery3.webp" },
    { name: "Nail Art Personalizada", description: "Desenhos exclusivos e tendências do momento para unhas únicas como você.", durationMin: 90, price: 95, image: "/images/gallery4.webp" },
    { name: "Esmaltação em Gel", description: "Cor intensa com brilho espelhado que dura até 21 dias sem lascar.", durationMin: 45, price: 70, image: "/images/gallery2.webp" },
    { name: "Blindagem", description: "Fortalecimento e proteção da unha natural com camada de blindagem em gel.", durationMin: 60, price: 60, image: "/images/gallery1.webp" },
  ];
  for (const s of services) {
    const exists = await db.service.findFirst({ where: { name: s.name } });
    if (!exists) await db.service.create({ data: s });
  }

  // Courses: exactly ONE real course (remove any mock courses, keep the real one up to date)
  const realCourse = {
    name: "Curso Pro Nails — Molde F1",
    description: "Curso em molde F1. Você vai aprender a técnica mais inovadora do mercado: o molde F1 tem metodologia simplificada e limpa. Exige atenção — nenhum método entrega sua verdadeira eficácia sem dedicação. Treinamos em modelos.",
    duration: "3 dias · presencial",
    level: "Iniciante",
    learnTheory: JSON.stringify([
      "Histologia e anatomia",
      "Parte química",
      "Conhecimento de materiais",
      "Todos os géis e preparadores",
    ]),
    learnPractice: JSON.stringify([
      "Tempos de cabine",
      "Preparação de lâmina",
      "Tipos de lâmina",
      "Adaptação de molde",
      "Lixamento de 15%",
    ]),
    included: JSON.stringify([
      "Apostila digital",
      "Certificado",
      "Coffee Break",
      "Treino em modelos",
      "Material completo para uso durante o treino",
      "Kit de materiais",
    ]),
    note: "A aluna fica responsável pelas manutenções ou remoção das modelos. É necessário trazer motor para uso no curso.",
    benefits: JSON.stringify([
      "Certificado impresso e em PDF",
      "Apostila em PDF",
      "Kit de materiais para uso no curso",
      "Treino em modelos reais",
    ]),
    priceLabel: "R$ 2.988 à vista",
    priceFull: "R$ 2.988",
    priceInstallments: "12x de R$ 249 no cartão",
    paymentNote:
      "Pix parcelado: o pagamento pode ser feito antes do curso, a aluna pode pagar por semana ou até por mês até a data do curso.",
    forWho: JSON.stringify([
      "Deseja ter liberdade financeira.",
      "Deseja ser vista como uma profissional expert que entrega excelência.",
      "Deseja viver mais tempo com a família.",
    ]),
    image: "/images/curso/capa.webp",
    active: true,
  };
  await db.course.updateMany({
    where: { name: { not: realCourse.name } },
    data: { active: false },
  });
  await db.course.deleteMany({ where: { name: { not: realCourse.name } } });
  const existingCourse = await db.course.findFirst({ where: { name: realCourse.name } });
  if (existingCourse) {
    await db.course.update({ where: { id: existingCourse.id }, data: realCourse });
  } else {
    await db.course.create({ data: realCourse });
  }

  // Work hours: Mon-Sat 09:00-18:00, Sunday closed
  for (let weekday = 0; weekday < 7; weekday++) {
    const data =
      weekday === 0
        ? { open: false, from: "09:00", to: "18:00" }
        : { open: true, from: "09:00", to: "18:00" };
    await db.workHours.upsert({ where: { weekday }, update: {}, create: { weekday, ...data } });
  }

  // Seed bookings (only if service exists and no booking at same date+time)
  const allServices = await db.service.findMany();
  const byName = (n: string) => allServices.find((s) => s.name === n);
  const seedBookings = [
    { serviceName: "Manicure Clássica", date: futureISO(1), time: "10:00", clientName: "Mariana Costa", clientPhone: "(11) 98888-1234", status: "CONFIRMADO" },
    { serviceName: "Alongamento em Gel", date: futureISO(2), time: "14:00", clientName: "Fernanda Almeida", clientPhone: "(11) 97777-4321", status: "PENDENTE" },
    { serviceName: "Esmaltação em Gel", date: futureISO(-3), time: "16:00", clientName: "Patrícia Menezes", clientPhone: "(11) 96666-9999", status: "CONCLUIDO" },
  ];
  for (const b of seedBookings) {
    const svc = byName(b.serviceName);
    if (!svc) continue;
    const dup = await db.booking.findFirst({ where: { date: b.date, time: b.time, status: { not: "CANCELADO" } } });
    if (!dup) {
      await db.booking.create({
        data: { serviceId: svc.id, date: b.date, time: b.time, clientName: b.clientName, clientPhone: b.clientPhone, status: b.status },
      });
    }
  }

  // Seed day block
  const blockDate = futureISO(5);
  const dupBlock = await db.dayBlock.findUnique({ where: { date: blockDate } });
  if (!dupBlock) await db.dayBlock.create({ data: { date: blockDate, reason: "Compromisso pessoal" } });

  // Seed gallery images (idempotent by url)
  const gallerySeed = [
    { url: "/images/gallery1.webp", caption: "Alongamento em gel com acabamento natural", order: 1 },
    { url: "/images/gallery2.webp", caption: "Esmaltação impecável em tom clássico", order: 2 },
    { url: "/images/gallery3.webp", caption: "Nail art sofisticada dourada", order: 3 },
    { url: "/images/gallery4.webp", caption: "Manutenção e blindagem da unha natural", order: 4 },
  ];
  for (const g of gallerySeed) {
    await db.galleryImage.upsert({ where: { url: g.url }, update: { caption: g.caption, order: g.order }, create: g });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
