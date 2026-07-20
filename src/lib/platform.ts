"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { getFirebaseServices } from "./firebase";
import { currentUser } from "./firebase-cloud";
import {
  isAdminEmail,
  trialEndDate,
  type Clinic,
  type ClinicMember,
  type ClinicStatus,
  type Invite,
  type Lead,
  type LeadStatus,
  type MemberRole,
  type PlanId,
  type SupportTicket,
  type TicketStatus,
  type UsageEvent,
} from "./platform-types";
import { canAcceptInvite, canInviteMember } from "./seats";

function requireDb() {
  const { db, auth } = getFirebaseServices();
  if (!db || !auth) throw new Error("Firebase não configurado.");
  return { db, auth };
}

function inviteUrl(inviteId: string) {
  if (typeof window === "undefined") return `/entrar?invite=${inviteId}`;
  return `${window.location.origin}/entrar?invite=${inviteId}`;
}

async function notifyInviteEmail(input: {
  to: string;
  clinicName: string;
  inviteId: string;
  role: string;
}) {
  try {
    await fetch("/api/email/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: input.to,
        clinicName: input.clinicName,
        inviteUrl: inviteUrl(input.inviteId),
        role: input.role,
      }),
    });
  } catch {
    /* e-mail é best-effort */
  }
}

async function notifyLeadEmail(payload: Record<string, string>) {
  try {
    await fetch("/api/email/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* best-effort */
  }
}

// —— Admin ——

export async function ensureAdminDoc() {
  const user = currentUser();
  if (!user?.email || !isAdminEmail(user.email)) return false;
  try {
    const token = await user.getIdToken();
    const res = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await user.getIdToken(true);
      return true;
    }
  } catch {
    /* segue para fallback */
  }
  // Fallback se Admin SDK ainda não estiver na Vercel (regras antigas)
  try {
    const { db } = requireDb();
    await setDoc(
      doc(db, "admins", user.uid),
      { email: user.email, updatedAt: new Date().toISOString() },
      { merge: true },
    );
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        role: "admin",
        clinicId: null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return true;
  } catch {
    return isAdminEmail(user.email);
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  const user = currentUser();
  if (!user) return false;
  if (isAdminEmail(user.email)) {
    await ensureAdminDoc();
    return true;
  }
  try {
    const { db } = requireDb();
    const snap = await getDoc(doc(db, "admins", user.uid));
    if (snap.exists()) return true;
  } catch {
    /* ignore */
  }
  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
}

// —— Leads ——

export async function submitLead(input: {
  name: string;
  email: string;
  phone: string;
  clinic: string;
  city: string;
  message: string;
  source?: string;
}) {
  const { db } = requireDb();
  const ref = await addDoc(collection(db, "leads"), {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    clinic: input.clinic.trim(),
    city: input.city.trim(),
    message: input.message.trim(),
    status: "novo" as LeadStatus,
    source: input.source ?? "site",
    createdAt: new Date().toISOString(),
  });
  await logUsage({
    type: "page_lead",
    userId: null,
    clinicId: null,
    meta: ref.id,
  });
  void notifyLeadEmail({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    clinic: input.clinic.trim(),
    city: input.city.trim(),
    message: input.message.trim(),
    source: input.source ?? "site",
    leadId: ref.id,
  });
  return ref.id;
}

export async function listLeads(): Promise<Lead[]> {
  const { db } = requireDb();
  const snap = await getDocs(
    query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(200)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, "id">) }));
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { db } = requireDb();
  await updateDoc(doc(db, "leads", id), { status });
}

// —— Clinics ——

export async function createClinicAsAdmin(input: {
  name: string;
  city: string;
  ownerEmail: string;
  plan?: PlanId;
  seats?: number;
  notes?: string;
}) {
  const user = currentUser();
  if (!user) throw new Error("Faça login como admin.");
  const { db } = requireDb();
  const now = new Date().toISOString();
  const clinicRef = doc(collection(db, "clinics"));
  const clinic: Omit<Clinic, "id"> = {
    name: input.name.trim(),
    city: input.city.trim(),
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    ownerId: null,
    status: "trial",
    plan: input.plan ?? "trial",
    seats: input.seats ?? 3,
    trialEndsAt: trialEndDate(),
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(clinicRef, clinic);

  const inviteRef = doc(collection(db, "invites"));
  const invite: Omit<Invite, "id"> = {
    clinicId: clinicRef.id,
    clinicName: clinic.name,
    email: clinic.ownerEmail,
    role: "owner",
    createdAt: now,
    createdBy: user.uid,
    usedAt: null,
  };
  await setDoc(inviteRef, invite);
  void notifyInviteEmail({
    to: clinic.ownerEmail,
    clinicName: clinic.name,
    inviteId: inviteRef.id,
    role: "owner",
  });

  return { clinicId: clinicRef.id, inviteId: inviteRef.id };
}

export async function listClinics(): Promise<Clinic[]> {
  const { db } = requireDb();
  const snap = await getDocs(
    query(collection(db, "clinics"), orderBy("createdAt", "desc"), limit(200)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Clinic, "id">) }));
}

export async function updateClinicStatus(
  clinicId: string,
  status: ClinicStatus,
  plan?: PlanId,
) {
  const { db } = requireDb();
  const patch: Record<string, string> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (plan) patch.plan = plan;
  if (status === "active") {
    patch.trialEndsAt = "";
  }
  await updateDoc(doc(db, "clinics", clinicId), patch);
}

export async function loadClinic(clinicId: string): Promise<Clinic | null> {
  const { db } = requireDb();
  const snap = await getDoc(doc(db, "clinics", clinicId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Clinic, "id">) };
}

export async function listClinicMembers(clinicId: string): Promise<ClinicMember[]> {
  const { db } = requireDb();
  const snap = await getDocs(collection(db, "clinics", clinicId, "members"));
  return snap.docs.map((d) => d.data() as ClinicMember);
}

export async function countPendingInvites(clinicId: string) {
  const { db } = requireDb();
  const snap = await getDocs(
    query(collection(db, "invites"), where("clinicId", "==", clinicId)),
  );
  return snap.docs.filter((d) => !d.data().usedAt).length;
}

export async function createMemberInvite(input: {
  clinicId: string;
  clinicName: string;
  email: string;
  role: MemberRole;
  /** Admin pode forçar convite mesmo no limite (ex.: reenviar owner). */
  bypassSeatCheck?: boolean;
}) {
  const user = currentUser();
  if (!user) throw new Error("Login necessário.");
  const { db } = requireDb();
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("Informe o e-mail.");

  const clinic = await loadClinic(input.clinicId);
  if (!clinic) throw new Error("Clínica não encontrada.");

  const members = await listClinicMembers(input.clinicId);
  const emailAlreadyMember = members.some((m) => m.email.toLowerCase() === email);
  const pendingInviteCount = await countPendingInvites(input.clinicId);

  if (!input.bypassSeatCheck) {
    const gate = canInviteMember({
      seats: clinic.seats,
      memberCount: members.length,
      pendingInviteCount,
      emailAlreadyMember,
    });
    if (!gate.ok) throw new Error(gate.reason);
  } else if (emailAlreadyMember && input.role !== "owner") {
    throw new Error("Este e-mail já é membro da clínica.");
  }

  const ref = doc(collection(db, "invites"));
  await setDoc(ref, {
    clinicId: input.clinicId,
    clinicName: input.clinicName,
    email,
    role: input.role,
    createdAt: new Date().toISOString(),
    createdBy: user.uid,
    usedAt: null,
  } satisfies Omit<Invite, "id">);

  void notifyInviteEmail({
    to: email,
    clinicName: input.clinicName,
    inviteId: ref.id,
    role: input.role,
  });

  return ref.id;
}

export async function loadInvite(inviteId: string): Promise<Invite | null> {
  const { db } = requireDb();
  const snap = await getDoc(doc(db, "invites", inviteId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Invite, "id">) };
}

export async function acceptInvite(inviteId: string, displayName: string) {
  const user = currentUser();
  if (!user?.email) throw new Error("Faça login ou cadastre-se primeiro.");
  const { db } = requireDb();
  const invite = await loadInvite(inviteId);
  if (!invite) throw new Error("Convite inválido.");
  if (invite.usedAt) throw new Error("Convite já utilizado.");
  if (invite.email !== user.email.toLowerCase()) {
    throw new Error("Este convite é para outro e-mail.");
  }

  const clinic = await loadClinic(invite.clinicId);
  if (!clinic) throw new Error("Clínica do convite não existe.");
  const members = await listClinicMembers(invite.clinicId);
  const alreadyMember = members.some((m) => m.uid === user.uid);
  const seatGate = canAcceptInvite({
    seats: clinic.seats,
    memberCount: members.length,
    alreadyMember,
  });
  if (!seatGate.ok) throw new Error(seatGate.reason);

  const now = new Date().toISOString();
  const member: ClinicMember = {
    uid: user.uid,
    email: user.email,
    name: displayName,
    role: invite.role,
    joinedAt: now,
  };
  await setDoc(doc(db, "clinics", invite.clinicId, "members", user.uid), member);
  await updateDoc(doc(db, "invites", inviteId), { usedAt: now });

  const clinicPatch: Record<string, unknown> = { updatedAt: now };
  if (invite.role === "owner") {
    clinicPatch.ownerId = user.uid;
  }
  await updateDoc(doc(db, "clinics", invite.clinicId), clinicPatch);

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      clinicId: invite.clinicId,
      role: "professional",
      updatedAt: now,
      createdAt: now,
    },
    { merge: true },
  );

  return invite.clinicId;
}

export async function createClinicOnSignup(input: {
  clinicName: string;
  city: string;
  ownerName: string;
}) {
  const user = currentUser();
  if (!user?.email) throw new Error("Login necessário.");
  const { db } = requireDb();
  const now = new Date().toISOString();
  const clinicRef = doc(collection(db, "clinics"));
  await setDoc(clinicRef, {
    name: input.clinicName.trim(),
    city: input.city.trim(),
    ownerEmail: user.email.toLowerCase(),
    ownerId: user.uid,
    status: "trial",
    plan: "trial",
    seats: 3,
    trialEndsAt: trialEndDate(),
    notes: "Criada no cadastro",
    createdAt: now,
    updatedAt: now,
  } satisfies Omit<Clinic, "id">);

  await setDoc(doc(db, "clinics", clinicRef.id, "members", user.uid), {
    uid: user.uid,
    email: user.email,
    name: input.ownerName,
    role: "owner",
    joinedAt: now,
  } satisfies ClinicMember);

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      clinicId: clinicRef.id,
      role: "professional",
      profile: {
        name: input.ownerName,
        registry: "",
        clinic: input.clinicName,
        city: input.city,
      },
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  return clinicRef.id;
}

export async function loadMyClinicId(): Promise<string | null> {
  const user = currentUser();
  if (!user) return null;
  const { db } = requireDb();
  const snap = await getDoc(doc(db, "users", user.uid));
  return (snap.data()?.clinicId as string | undefined) ?? null;
}

// —— Tickets ——

export async function createTicket(subject: string, body: string) {
  const user = currentUser();
  if (!user?.email) throw new Error("Login necessário.");
  const { db } = requireDb();
  const clinicId = await loadMyClinicId();
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, "tickets"), {
    userId: user.uid,
    userEmail: user.email,
    clinicId,
    subject: subject.trim(),
    body: body.trim(),
    status: "aberto" as TicketStatus,
    createdAt: now,
    updatedAt: now,
    adminNote: "",
  });
  return ref.id;
}

export async function listMyTickets(): Promise<SupportTicket[]> {
  const user = currentUser();
  if (!user) return [];
  const { db } = requireDb();
  const snap = await getDocs(
    query(
      collection(db, "tickets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50),
    ),
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<SupportTicket, "id">),
  }));
}

export async function listAllTickets(): Promise<SupportTicket[]> {
  const { db } = requireDb();
  const snap = await getDocs(
    query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(100)),
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<SupportTicket, "id">),
  }));
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  adminNote?: string,
) {
  const { db } = requireDb();
  await updateDoc(doc(db, "tickets", id), {
    status,
    updatedAt: new Date().toISOString(),
    ...(adminNote !== undefined ? { adminNote } : {}),
  });
}

// —— Usage ——

export async function logUsage(input: {
  type: UsageEvent["type"];
  userId: string | null;
  clinicId: string | null;
  meta?: string;
}) {
  try {
    const { db } = requireDb();
    await addDoc(collection(db, "usage_events"), {
      type: input.type,
      userId: input.userId,
      clinicId: input.clinicId,
      meta: input.meta ?? "",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // analytics não deve quebrar o fluxo
  }
}

export async function listUsage(limitN = 100): Promise<UsageEvent[]> {
  const { db } = requireDb();
  const snap = await getDocs(
    query(
      collection(db, "usage_events"),
      orderBy("createdAt", "desc"),
      limit(limitN),
    ),
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<UsageEvent, "id">),
  }));
}

// —— Account deletion ——

export async function deleteMyAccount() {
  const user = currentUser();
  if (!user) throw new Error("Não autenticado.");
  const { db, auth } = requireDb();

  const clinicId = await loadMyClinicId();
  const batch = writeBatch(db);

  const hist = await getDocs(
    query(collection(db, "users", user.uid, "consultations"), limit(100)),
  );
  hist.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", user.uid));

  if (clinicId) {
    batch.delete(doc(db, "clinics", clinicId, "members", user.uid));
  }

  await batch.commit();

  try {
    await deleteUser(user);
  } catch {
    await auth.signOut();
    throw new Error(
      "Dados apagados. Para excluir o login, saia e entre de novo e tente novamente (pode exigir reautenticação).",
    );
  }
}
