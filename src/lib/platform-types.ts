/** Modelo de negócio — clínicas, leads, planos, tickets */

export type ClinicStatus = "trial" | "active" | "suspended" | "cancelled";
export type PlanId = "trial" | "mensal" | "anual" | "piloto";
export type ClinicEnvironment = "demo" | "client";
export type MemberRole = "owner" | "admin" | "member";
export type LeadStatus =
  | "novo"
  | "contatado"
  | "piloto"
  | "cliente"
  | "descartado"
  | "demo_solicitado"
  | "demo_liberado"
  | "cliente_liberado";
export type TicketStatus = "aberto" | "em_andamento" | "resolvido";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic: string;
  /** Empresa / clínica solicitante (alias de clinic na UI de demo). */
  company?: string;
  city: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  source: string;
  /** Clínica criada ao liberar demo/cliente. */
  clinicId?: string | null;
};

export type Clinic = {
  id: string;
  name: string;
  city: string;
  ownerEmail: string;
  ownerId: string | null;
  status: ClinicStatus;
  plan: PlanId;
  /** Ambiente de uso: demonstração ou cliente. */
  environment: ClinicEnvironment;
  seats: number;
  trialEndsAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  leadId?: string | null;
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

export const ENVIRONMENT_LABELS: Record<ClinicEnvironment, string> = {
  demo: "Demonstração",
  client: "Cliente",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  piloto: "Piloto",
  cliente: "Cliente",
  descartado: "Descartado",
  demo_solicitado: "Demo solicitada",
  demo_liberado: "Demo liberada",
  cliente_liberado: "Cliente liberado",
};

export function normalizeClinicEnvironment(
  value: unknown,
): ClinicEnvironment {
  return value === "demo" ? "demo" : "client";
}

export function trialEndDate(from = new Date(), days = 14) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Licença da clínica permite uso da ferramenta. Sem clínica = sem acesso. */
export function isClinicAccessAllowed(clinic: Clinic | null) {
  if (!clinic) return false;
  if (clinic.status === "suspended" || clinic.status === "cancelled") return false;
  if (clinic.status === "trial" && clinic.trialEndsAt) {
    return new Date(clinic.trialEndsAt).getTime() > Date.now();
  }
  return clinic.status === "active" || clinic.status === "trial";
}

export type ToolAccessReason =
  | "ok"
  | "loading"
  | "no_auth"
  | "no_clinic"
  | "license"
  | "unavailable";

/** Resolve se o profissional pode abrir a ferramenta. */
export function resolveToolAccess(input: {
  firebaseConfigured: boolean;
  userId: string | null;
  clinic: Clinic | null;
}): ToolAccessReason {
  if (!input.firebaseConfigured) return "unavailable";
  if (!input.userId) return "no_auth";
  if (!input.clinic) return "no_clinic";
  return isClinicAccessAllowed(input.clinic) ? "ok" : "license";
}

/** Conta em ambiente de demonstração (só ferramenta). */
export function isDemoClinic(clinic: Clinic | null | undefined) {
  return Boolean(clinic && clinic.environment === "demo");
}

/** Painel /clinica (equipe, billing, histórico) — só cliente. */
export function canAccessClientPanel(clinic: Clinic | null | undefined) {
  return Boolean(
    clinic &&
      clinic.environment === "client" &&
      isClinicAccessAllowed(clinic),
  );
}

/** Destino após login / aceite de convite. */
export function postAuthDestination(clinic: Clinic | null | undefined) {
  return isDemoClinic(clinic) ? "/consulta" : "/clinica";
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
