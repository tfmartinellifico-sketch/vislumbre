/** Modelo de negócio — clínicas, leads, planos, tickets */

export type ClinicStatus = "trial" | "active" | "suspended" | "cancelled";
export type PlanId = "trial" | "mensal" | "anual" | "piloto";
export type MemberRole = "owner" | "admin" | "member";
export type LeadStatus = "novo" | "contatado" | "piloto" | "cliente" | "descartado";
export type TicketStatus = "aberto" | "em_andamento" | "resolvido";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic: string;
  city: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  source: string;
};

export type Clinic = {
  id: string;
  name: string;
  city: string;
  ownerEmail: string;
  ownerId: string | null;
  status: ClinicStatus;
  plan: PlanId;
  seats: number;
  trialEndsAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ClinicMember = {
  uid: string;
  email: string;
  name: string;
  role: MemberRole;
  joinedAt: string;
};

export type Invite = {
  id: string;
  clinicId: string;
  clinicName: string;
  email: string;
  role: MemberRole;
  createdAt: string;
  createdBy: string;
  usedAt: string | null;
};

export type SupportTicket = {
  id: string;
  userId: string;
  userEmail: string;
  clinicId: string | null;
  subject: string;
  body: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  adminNote: string;
};

export type UsageEvent = {
  id: string;
  type: "consulta_export" | "consulta_start" | "login" | "page_lead";
  userId: string | null;
  clinicId: string | null;
  meta?: string;
  createdAt: string;
};

export type UserRecord = {
  email: string;
  clinicId: string | null;
  role: "admin" | "professional";
  profile?: {
    name: string;
    registry: string;
    clinic: string;
    city: string;
  };
  createdAt?: string;
  updatedAt: string;
};

export const PLAN_LABELS: Record<PlanId, string> = {
  trial: "Trial 14 dias",
  mensal: "Mensal",
  anual: "Anual",
  piloto: "Piloto",
};

export const STATUS_LABELS: Record<ClinicStatus, string> = {
  trial: "Em trial",
  active: "Ativa",
  suspended: "Suspensa",
  cancelled: "Cancelada",
};

export function trialEndDate(from = new Date(), days = 14) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isClinicAccessAllowed(clinic: Clinic | null) {
  if (!clinic) return true; // uso local sem clínica
  if (clinic.status === "suspended" || clinic.status === "cancelled") return false;
  if (clinic.status === "trial" && clinic.trialEndsAt) {
    return new Date(clinic.trialEndsAt).getTime() > Date.now();
  }
  return clinic.status === "active" || clinic.status === "trial";
}

export function adminEmailsFromEnv() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const list = adminEmailsFromEnv();
  if (!list.length) return false;
  return list.includes(email.toLowerCase());
}
