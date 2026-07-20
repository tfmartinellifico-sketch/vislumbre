"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Logo } from "@/components/brand/Logo";
import { FirebaseAccount } from "@/components/clinica/FirebaseAccount";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  checkIsAdmin,
  createClinicAsAdmin,
  createMemberInvite,
  liberateClientFromLead,
  liberateDemoFromLead,
  listAllTickets,
  listClinics,
  listLeads,
  listUsage,
  promoteClinicToClient,
  updateClinicStatus,
  updateLeadStatus,
  updateTicketStatus,
} from "@/lib/platform";
import {
  ENVIRONMENT_LABELS,
  LEAD_STATUS_LABELS,
  PLAN_LABELS,
  STATUS_LABELS,
  type Clinic,
  type ClinicStatus,
  type Lead,
  type LeadStatus,
  type PlanId,
  type SupportTicket,
  type UsageEvent,
} from "@/lib/platform-types";
import { computePilotMetrics } from "@/lib/metrics";
import { APP_COPY } from "@/lib/app-copy";

type Tab = "leads" | "clinicas" | "tickets" | "uso" | "criar" | "metricas";

export function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [usage, setUsage] = useState<UsageEvent[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const [newClinic, setNewClinic] = useState({
    name: "",
    city: "",
    ownerEmail: "",
    seats: 3,
    plan: "trial" as PlanId,
    notes: "",
  });

  const metrics = computePilotMetrics(clinics, usage);

  const refresh = useCallback(async () => {
    if (!(await checkIsAdmin())) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
    const [l, c, t, u] = await Promise.all([
      listLeads(),
      listClinics(),
      listAllTickets(),
      listUsage(500),
    ]);
    setLeads(l);
    setClinics(c);
    setTickets(t);
    setUsage(u);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      refresh().catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user, refresh]);

  async function handleCreateClinic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const { clinicId, inviteId } = await createClinicAsAdmin(newClinic);
      const link = `${window.location.origin}/entrar?invite=${inviteId}`;
      setInviteLink(link);
      setMsg(`Clínica criada (${clinicId}). Convite enviado por e-mail (se Resend) e link abaixo.`);
      setNewClinic({
        name: "",
        city: "",
        ownerEmail: "",
        seats: 3,
        plan: "trial",
        notes: "",
      });
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha ao criar clínica.");
    } finally {
      setBusy(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <Shell>
        <p className="text-ink-soft">Configure o Firebase para usar o admin.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8">
        <p className="eyebrow">Administração</p>
        <h1 className="display mt-2 text-4xl tracking-tight">Painel Vislumbre</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-soft">
          {APP_COPY.admin.intro}
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <FirebaseAccount
          onUserChange={setUser}
          defaultMode="login"
          initialEmail={
            process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0]?.trim() ?? ""
          }
        />
        {!user && (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Se não lembrar a senha, clique em{" "}
            <strong className="font-medium text-ink">Recuperar senha</strong> —
            o Firebase envia o link para o seu e-mail.
          </p>
        )}
      </div>

      {user && !isAdmin && (
        <div className="max-w-xl rounded-xl border border-warn/30 bg-warn/[0.05] px-4 py-4 text-[14px]">
          <p className="font-medium text-warn">Sem permissão de administração</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Você entrou, mas este e-mail não está autorizado no painel. Confirme
            com quem configura a plataforma se o seu e-mail está na lista de
            administradores.
          </p>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="mb-8 flex flex-wrap gap-2">
            {(
              [
                ["metricas", "Piloto"],
                ["leads", `Leads (${leads.length})`],
                ["clinicas", `Clínicas (${clinics.length})`],
                ["criar", "Criar / convidar"],
                ["tickets", `Tickets (${tickets.filter((t) => t.status !== "resolvido").length})`],
                ["uso", "Uso"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-[13px] ${
                  tab === id
                    ? "bg-sea-deep text-paper"
                    : "border border-ink/10 text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => refresh()}
              className="rounded-full border border-ink/10 px-4 py-2 text-[13px] text-ink-soft"
            >
              Atualizar
            </button>
          </div>

          {msg && (
            <p className="mb-4 rounded-xl border border-sea/20 bg-sea/[0.05] px-4 py-3 text-[13px] text-sea-deep">
              {msg}
            </p>
          )}

          {tab === "metricas" && (
            <section className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["Consultas (semana)", metrics.consultationsThisWeek],
                    ["Consultas (sem. ant.)", metrics.consultationsPrevWeek],
                    ["Logins (semana)", metrics.loginsThisWeek],
                    ["Leads (semana)", metrics.leadsThisWeek],
                    ["Clínicas ativas", metrics.activeClinics],
                    ["Em trial", metrics.trialClinics],
                    ["Suspensas/canceladas", metrics.suspendedClinics],
                    ["Trials a vencer (7d)", metrics.trialsExpiringSoon.length],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-ink/10 bg-paper px-4 py-4"
                  >
                    <p className="text-[11px] text-ink-soft">{label}</p>
                    <p className="display mt-1 text-3xl text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="display text-2xl">Trials a vencer em 7 dias</h2>
                {metrics.trialsExpiringSoon.length === 0 ? (
                  <p className="mt-3 text-[13px] text-ink-soft">Nenhum no horizonte.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {metrics.trialsExpiringSoon.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-lg border border-warn/20 bg-warn/[0.04] px-3 py-2 text-[13px]"
                      >
                        {t.name} · {t.daysLeft} dia(s) ·{" "}
                        {new Date(t.trialEndsAt).toLocaleDateString("pt-BR")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {tab === "leads" && (
            <section className="space-y-3">
              {leads.length === 0 && (
                <p className="text-ink-soft">Nenhum lead ainda.</p>
              )}
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-xl border border-ink/10 bg-paper p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{lead.name}</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        {lead.email} · {lead.phone || "sem telefone"}
                      </p>
                      <p className="text-[12px] text-ink-soft">
                        {lead.company || lead.clinic || "—"} · {lead.city || "—"}
                      </p>
                      {lead.message && (
                        <p className="mt-2 text-[13px] text-ink-soft">{lead.message}</p>
                      )}
                      <p className="mt-2 text-[11px] text-ink-soft/70">
                        {new Date(lead.createdAt).toLocaleString("pt-BR")} ·{" "}
                        {lead.source}
                        {lead.clinicId ? ` · clínica ${lead.clinicId}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={lead.status}
                        onChange={async (e) => {
                          await updateLeadStatus(
                            lead.id,
                            e.target.value as LeadStatus,
                          );
                          await refresh();
                        }}
                        className="rounded-lg border border-ink/15 px-2 py-1.5 text-[12px]"
                      >
                        {(
                          [
                            "novo",
                            "demo_solicitado",
                            "demo_liberado",
                            "contatado",
                            "piloto",
                            "cliente",
                            "cliente_liberado",
                            "descartado",
                          ] as LeadStatus[]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {LEAD_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            setMsg("");
                            try {
                              const r = await liberateDemoFromLead(lead.id);
                              const link = `${window.location.origin}/entrar?invite=${r.inviteId}`;
                              setInviteLink(link);
                              setMsg(
                                r.reused
                                  ? "Demo já vinculada — novo convite gerado."
                                  : "Demo liberada. Convite enviado (se Resend) e link abaixo.",
                              );
                              await refresh();
                            } catch (err) {
                              setMsg(
                                err instanceof Error
                                  ? err.message
                                  : "Falha ao liberar demo.",
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className="rounded-lg bg-sea/15 px-2.5 py-1.5 text-[11px] text-sea-deep"
                        >
                          Liberar demo
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            setMsg("");
                            try {
                              const r = await liberateClientFromLead(
                                lead.id,
                                "mensal",
                              );
                              if (r.inviteId) {
                                setInviteLink(
                                  `${window.location.origin}/entrar?invite=${r.inviteId}`,
                                );
                              }
                              setMsg(
                                "Cliente liberado (ambiente client, status ativo).",
                              );
                              await refresh();
                            } catch (err) {
                              setMsg(
                                err instanceof Error
                                  ? err.message
                                  : "Falha ao liberar cliente.",
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className="rounded-lg bg-ink px-2.5 py-1.5 text-[11px] text-paper"
                        >
                          Liberar cliente
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {inviteLink && tab === "leads" && (
                <div className="rounded-xl bg-fog px-3 py-3 text-[12px] break-all text-ink">
                  <p className="font-medium">Link de convite</p>
                  <a href={inviteLink} className="text-sea-deep underline">
                    {inviteLink}
                  </a>
                </div>
              )}
            </section>
          )}

          {tab === "clinicas" && (
            <section className="space-y-3">
              {clinics.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-ink/10 bg-paper p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        {c.ownerEmail} · {c.city} · {c.seats} assentos
                      </p>
                      <p className="text-[12px] text-ink-soft">
                        {ENVIRONMENT_LABELS[c.environment ?? "client"]} ·{" "}
                        {STATUS_LABELS[c.status]} · {PLAN_LABELS[c.plan]}
                        {c.trialEndsAt
                          ? ` · trial até ${new Date(c.trialEndsAt).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                      {c.notes && (
                        <p className="mt-2 text-[12px] text-ink-soft">{c.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["trial", "Trial"],
                          ["active", "Ativar"],
                          ["suspended", "Suspender"],
                          ["cancelled", "Cancelar"],
                        ] as [ClinicStatus, string][]
                      ).map(([st, label]) => (
                        <button
                          key={st}
                          type="button"
                          onClick={async () => {
                            await updateClinicStatus(
                              c.id,
                              st,
                              st === "active" ? "mensal" : undefined,
                            );
                            await refresh();
                          }}
                          className="rounded-lg border border-ink/10 px-2.5 py-1 text-[11px] text-ink-soft hover:border-sea"
                        >
                          {label}
                        </button>
                      ))}
                      {c.environment !== "client" && (
                        <button
                          type="button"
                          onClick={async () => {
                            await promoteClinicToClient(c.id, "mensal");
                            setMsg("Clínica promovida para cliente.");
                            await refresh();
                          }}
                          className="rounded-lg bg-ink px-2.5 py-1 text-[11px] text-paper"
                        >
                          Virar cliente
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          const id = await createMemberInvite({
                            clinicId: c.id,
                            clinicName: c.name,
                            email: c.ownerEmail,
                            role: "owner",
                            bypassSeatCheck: true,
                          });
                          setInviteLink(
                            `${window.location.origin}/entrar?invite=${id}`,
                          );
                          setMsg(
                            "Novo convite gerado e e-mail disparado (se Resend ok).",
                          );
                        }}
                        className="rounded-lg bg-sea/10 px-2.5 py-1 text-[11px] text-sea-deep"
                      >
                        Reenviar convite
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === "criar" && (
            <form
              onSubmit={handleCreateClinic}
              className="max-w-lg space-y-3 rounded-2xl border border-ink/10 bg-paper p-6"
            >
              <h2 className="display text-2xl">Nova clínica / convite</h2>
              <p className="text-[13px] text-ink-soft">
                Cria a clínica em trial e gera link para o cliente criar a senha
                e entrar.
              </p>
              <AdminField
                label="Nome da clínica"
                value={newClinic.name}
                onChange={(v) => setNewClinic((s) => ({ ...s, name: v }))}
                required
              />
              <AdminField
                label="Cidade"
                value={newClinic.city}
                onChange={(v) => setNewClinic((s) => ({ ...s, city: v }))}
              />
              <AdminField
                label="E-mail do responsável"
                value={newClinic.ownerEmail}
                onChange={(v) => setNewClinic((s) => ({ ...s, ownerEmail: v }))}
                type="email"
                required
              />
              <AdminField
                label="Assentos"
                value={String(newClinic.seats)}
                onChange={(v) =>
                  setNewClinic((s) => ({ ...s, seats: Number(v) || 3 }))
                }
                type="number"
              />
              <AdminField
                label="Notas internas"
                value={newClinic.notes}
                onChange={(v) => setNewClinic((s) => ({ ...s, notes: v }))}
              />
              <button
                type="submit"
                disabled={busy}
                className="btn-primary disabled:opacity-40"
              >
                {busy ? "Criando…" : "Criar clínica e gerar convite"}
              </button>
              {inviteLink && (
                <div className="rounded-xl bg-fog px-3 py-3 text-[12px] break-all text-ink">
                  <p className="font-medium">Link de convite</p>
                  <a href={inviteLink} className="text-sea-deep underline">
                    {inviteLink}
                  </a>
                </div>
              )}
            </form>
          )}

          {tab === "tickets" && (
            <section className="space-y-3">
              {tickets.map((t) => (
                <article
                  key={t.id}
                  className="rounded-xl border border-ink/10 bg-paper p-4"
                >
                  <p className="font-medium text-ink">{t.subject}</p>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    {t.userEmail} · {t.status}
                  </p>
                  <p className="mt-2 text-[13px] text-ink-soft">{t.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["aberto", "em_andamento", "resolvido"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={async () => {
                            await updateTicketStatus(t.id, st);
                            await refresh();
                          }}
                          className="rounded-lg border border-ink/10 px-2 py-1 text-[11px]"
                        >
                          {st}
                        </button>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === "uso" && (
            <section className="space-y-2">
              <p className="mb-4 text-[13px] text-ink-soft">
                Eventos recentes (export, login, leads…). Sem fotos.
              </p>
              {usage.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap justify-between gap-2 rounded-lg border border-ink/8 px-3 py-2 text-[12px] text-ink-soft"
                >
                  <span>
                    {u.type}
                    {u.meta ? ` · ${u.meta}` : ""}
                  </span>
                  <span>{new Date(u.createdAt).toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex gap-4 text-[13px]">
            <Link href="/consulta" className="text-ink-soft hover:text-ink">
              Ferramenta
            </Link>
            <Link href="/clinica" className="text-ink-soft hover:text-ink">
              Clínica
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12">{children}</main>
    </div>
  );
}

function AdminField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[12px] text-ink-soft">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px] text-ink outline-none focus:border-sea"
      />
    </label>
  );
}
