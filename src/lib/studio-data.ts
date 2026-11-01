export type Role = "admin" | "client" | "visitor";

export interface Session {
  role: Role;
  name: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number; // in BRL
  image: string;
  imagePosition?: string; // CSS object-position (ex: "center", "top", "50% 20%")
  active: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
  benefits: string[];
  learnTheory: string[];
  learnPractice: string[];
  included: string[];
  note: string;
  priceLabel: string; // "Sob consulta" | "Preço em breve" | price summary
  priceFull: string; // "R$ 2.988"
  priceInstallments: string; // "12x de R$ 249 no cartão"
  paymentNote: string;
  forWho: string[];
  image: string;
  imagePosition?: string;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string | null;
  order: number;
  imagePosition?: string;
  active: boolean;
}

export type BookingStatus = "PENDENTE" | "CONFIRMADO" | "CONCLUIDO" | "CANCELADO";

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  clientName: string;
  clientPhone: string;
  status: BookingStatus;
  createdAt: string;
}

export interface WorkHours {
  // 0=Sunday ... 6=Saturday
  [weekday: number]: { open: boolean; from: string; to: string };
}

export interface DayBlock {
  id: string;
  date: string; // yyyy-MM-dd
  reason?: string;
}

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const DEFAULT_WORK_HOURS: WorkHours = {
  0: { open: false, from: "09:00", to: "17:00" },
  1: { open: true, from: "09:00", to: "18:00" },
  2: { open: true, from: "09:00", to: "18:00" },
  3: { open: true, from: "09:00", to: "18:00" },
  4: { open: true, from: "09:00", to: "19:00" },
  5: { open: true, from: "09:00", to: "19:00" },
  6: { open: true, from: "09:00", to: "15:00" },
};

export const BUSINESS = {
  name: "Jacootinha Nails",
  tagline: "Especialista em alongamentos sofisticados. Realço a beleza natural das suas unhas.",
  instagram: { handle: "jacootinhanails", url: "https://instagram.com/jacootinhanails" },
  whatsapp: {
    display: "+55 19 99850-4614",
    url: "https://wa.me/5519998504614",
    number: "5519998504614",
  },
  heroEyebrow: "Agenda fechada · Técnicas Russo-Brasileira · Unhas de alto padrão · Gel sem lixamento",
};

export function buildWhatsAppBookingMessage(input: {
  serviceName: string;
  dateBR: string;
  weekday?: string;
  time: string;
  name: string;
  phone: string;
}): string {
  const datePart = input.weekday ? `${input.dateBR} (${input.weekday})` : input.dateBR;
  return [
    "Olá! Gostaria de confirmar meu agendamento:",
    "",
    `• Serviço: ${input.serviceName}`,
    `• Data: ${datePart}`,
    `• Hora: ${input.time}`,
    `• Nome: ${input.name}`,
    `• Telefone: ${input.phone}`,
    "",
    "Aguardo a confirmação. Obrigada!",
  ].join("\n");
}

export const MOCK_SERVICES: Service[] = [
  {
    id: "svc-1",
    name: "Manicure Clássica",
    description: "Cutilagem delicada, lixamento e esmaltação impecável com acabamento profissional.",
    durationMin: 60,
    price: 45,
    image: "/images/gallery1.webp",
    active: true,
  },
  {
    id: "svc-2",
    name: "Pedicure Spa",
    description: "Relaxante ritual com hidratação profunda, esfoliação e esmaltação perfeita.",
    durationMin: 75,
    price: 65,
    image: "/images/gallery2.webp",
    active: true,
  },
  {
    id: "svc-3",
    name: "Alongamento em Gel",
    description: "Unhas longas e naturais com gel de alta durabilidade, moldadas sob medida.",
    durationMin: 120,
    price: 180,
    image: "/images/gallery3.webp",
    active: true,
  },
  {
    id: "svc-4",
    name: "Nail Art Personalizada",
    description: "Desenhos exclusivos e tendências do momento para unhas únicas como você.",
    durationMin: 90,
    price: 95,
    image: "/images/gallery4.webp",
    active: true,
  },
  {
    id: "svc-5",
    name: "Esmaltação em Gel",
    description: "Cor intensa com brilho espelhado que dura até 21 dias sem lascar.",
    durationMin: 45,
    price: 70,
    image: "/images/gallery2.webp",
    active: true,
  },
  {
    id: "svc-6",
    name: "Blindagem",
    description: "Fortalecimento e proteção da unha natural com camada de blindagem em gel.",
    durationMin: 60,
    price: 60,
    image: "/images/gallery1.webp",
    active: true,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "crs-1",
    name: "Curso Pro Nails — Molde F1",
    description:
      "Curso em molde F1. Você vai aprender a técnica mais inovadora do mercado: o molde F1 tem metodologia simplificada e limpa. Exige atenção — nenhum método entrega sua verdadeira eficácia sem dedicação. Treinamos em modelos.",
    duration: "3 dias · presencial",
    level: "Iniciante",
    benefits: [
      "Certificado impresso e em PDF",
      "Apostila em PDF",
      "Kit de materiais para uso no curso",
      "Treino em modelos reais",
    ],
    learnTheory: ["Histologia e anatomia", "Parte química", "Conhecimento de materiais", "Todos os géis e preparadores"],
    learnPractice: ["Tempos de cabine", "Preparação de lâmina", "Tipos de lâmina", "Adaptação de molde", "Lixamento de 15%"],
    included: ["Contrato", "Apostila em PDF", "Certificado impresso e em PDF", "3 dias de curso", "Kit de materiais para uso no curso"],
    note: "A aluna fica responsável pelas manutenções ou remoção das modelos. É necessário trazer motor para uso no curso.",
    priceLabel: "R$ 2.988 à vista",
    priceFull: "R$ 2.988",
    priceInstallments: "12x de R$ 249 no cartão",
    paymentNote:
      "Pix parcelado: o pagamento pode ser feito antes do curso, a aluna pode pagar por semana ou até por mês até a data do curso.",
    forWho: [
      "Deseja ter liberdade financeira.",
      "Deseja ser vista como uma profissional expert que entrega excelência.",
      "Deseja viver mais tempo com a família.",
    ],
    image: "/images/curso/capa.webp",
    active: true,
  },
];

export const MOCK_TESTIMONIALS = [
  {
    id: "t1",
    name: "Mariana Costa",
    text: "Simplesmente o melhor studio da cidade! O alongamento em gel ficou impecável e durou mais de 3 semanas. Atendimento nota mil.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Fernanda Almeida",
    text: "Ambiente super aconchegante e a profissional é extremamente caprichosa. Minha pedicure spa foi um verdadeiro momento de autocuidado.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Juliana Ribeiro",
    text: "Fiz o curso de manicure profissional e hoje tenho minha própria clientela. Conteúdo incrível e suporte maravilhoso!",
    rating: 5,
  },
  {
    id: "t4",
    name: "Patrícia Menezes",
    text: "A nail art personalizada é outro nível — levo uma foto de referência e fica ainda mais bonita. Recomendo de olhos fechados!",
    rating: 5,
  },
];

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Mock occupied slots keyed by "yyyy-MM-dd"
export const MOCK_OCCUPIED: Record<string, string[]> = {
  "2026-01-15": ["10:00", "14:00"],
  "2026-01-16": ["09:00", "11:00", "16:00"],
};

export const ADMIN_CREDENTIALS = {
  email: "admin@jacootinha.com",
  password: "admin123",
  name: "Jacootinha",
};

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function futureISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
