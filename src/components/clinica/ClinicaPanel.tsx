"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { FirebaseAccount } from "./FirebaseAccount";
import {
  clearCloudHistory,
  deleteCloudConsulta,
  loadCloudHistory,
  loadCloudProfile,
  migrateLocalData,
  saveCloudProfile,
} from "@/lib/firebase-cloud";
import {
  clearHistory,
  deleteConsulta,
  loadHistory,
  loadProfile,
  saveProfile,
  stashReopenConsulta,
  type ProfessionalProfile,
  type SavedConsulta,
} from "@/lib/storage";
import { SCENARIOS } from "@/lib/regions";
import { preferenceLabel } from "@/lib/alignment";
import {
  createMemberInvite,
  createTicket,
  deleteMyAccount,
  listClinicMembers,
  listMyTickets,
  loadClinic,
  loadMyClinicId,
  logUsage,
} from "@/lib/platform";
import {
  ENVIRONMENT_LABELS,
  canAccessClientPanel,
  isClinicAccessAllowed,
  isDemoClinic,
  PLAN_LABELS,
  STATUS_LABELS,
  type Clinic,
  type ClinicMember,
  type SupportTicket,
} from "@/lib/platform-types";
import {
  exportHistoryCsv,
  exportHistoryJson,
  exportHistoryZipWithPhotos,
  exportTransferPack,
} from "@/lib/exportData";
import { APP_COPY } from "@/lib/app-copy";

export function ClinicaPanel() {
  const cp = APP_COPY.clinica;
  const [profile, setProfile] = useState<ProfessionalProfile>({
    name: "",
    registry: "",
    clinic: "",
    city: "",
  });
  const [history, setHistory] = useState<SavedConsulta[]>([]);
  const [savedMsg, setSavedMsg] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("");
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [members, setMembers] = useState<ClinicMember[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [zipConsent, setZipConsent] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [orgReady, setOrgReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(loadProfile());
      setHistory(loadHistory());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const loadOrg = useCallback(async () => {
    const clinicId = await loadMyClinicId();
    if (!clinicId) {
      setClinic(null);
      setMembers([]);
      return;
    }
    const [c, m, t] = await Promise.all([
      loadClinic(clinicId),
      listClinicMembers(clinicId),
      listMyTickets(),
    ]);
    setClinic(c);
    setMembers(m);
    setTickets(t);
  }, []);

  const handleUserChange = useCallback(
    async (next: User | null) => {
      setUser(next);
      if (!next) {
        setClinic(null);
        setMembers([]);
        setOrgReady(true);
        return;
      }
      setOrgReady(false);
      setCloudBusy(true);
      try {
        await logUsage({
          type: "login",
          userId: next.uid,
          clinicId: await loadMyClinicId(),
        });
        const [cloudProfile, cloudHistory] = await Promise.all([
          loadCloudProfile(),
          loadCloudHistory(),
        ]);
        if (cloudProfile) {
          setProfile(cloudProfile);
          saveProfile(cloudProfile);
        }
        if (cloudHistory.length) {
          const merged = mergeHistory(loadHistory(), cloudHistory);
          setHistory(merged);
          localStorage.setItem(
            "vislumbre.history.v1",
            JSON.stringify(merged.slice(0, 40)),
          );
        }
        await loadOrg();
        setCloudMessage("Dados da nuvem carregados.");
      } catch {
        setCloudMessage(
          "Não foi possível carregar a nuvem. O modo local segue ativo.",
        );
      } finally {
        setCloudBusy(false);
        setOrgReady(true);
      }
    },
    [loadOrg],
  );

  async function persist() {
    saveProfile(profile);
    if (user) {
      setCloudBusy(true);
      try {
        await saveCloudProfile(profile);
        setCloudMessage("Perfil sincronizado.");
      } catch {
        setCloudMessage("Perfil salvo localmente; falha ao sincronizar.");
      } finally {
        setCloudBusy(false);
      }
    }
    setSavedMsg(true);
    window.setTimeout(() => setSavedMsg(false), 1800);
  }

  async function migrate() {
    setCloudBusy(true);
    try {
      await migrateLocalData(loadProfile(), loadHistory());
      setCloudMessage("Dados locais enviados à nuvem.");
    } catch {
      setCloudMessage("Falha na migração.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function removeOne(id: string) {
    setHistory(deleteConsulta(id));
    if (user) {
      try {
        await deleteCloudConsulta(id);
      } catch {
        setCloudMessage("Excluído localmente; nuvem não respondeu.");
      }
    }
  }

  async function removeAll() {
    clearHistory();
    setHistory([]);
    if (user) {
      try {
        await clearCloudHistory();
      } catch {
        setCloudMessage("Histórico local limpo; falha na nuvem.");
      }
    }
  }

  const accessOk = isClinicAccessAllowed(clinic);
  const clientPanelOk = canAccessClientPanel(clinic);
  const demoOnly = isDemoClinic(clinic);

  async function startCheckout(plan: "mensal" | "anual") {
    if (!clinic || !user) return;
    setBillingBusy(true);
    setActionMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clinicId: clinic.id, plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout indisponível.");
      }
      window.location.href = data.url;
    } catch (err) {
      setActionMsg(
        err instanceof Error
          ? err.message
          : "Falha ao abrir checkout Stripe.",
      );
    } finally {
      setBillingBusy(false);
    }
  }

  if (user && !orgReady) {
    return (
      <div className="grain atmosphere flex min-h-screen items-center justify-center px-5">
        <p className="text-[14px] text-ink-soft">Verificando acesso…</p>
      </div>
    );
  }

  if (user && demoOnly) {
    return (
      <div className="grain atmosphere flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <Logo href="/" size="md" />
        <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-sand">
          Demonstração
        </p>
        <h1 className="display mt-3 text-3xl text-ink">{cp.demoOnlyTitle}</h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {cp.demoOnlyBody}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/consulta" className="btn-primary">
            {cp.demoOnlyCta}
          </Link>
          <Link
            href="/entrar"
            className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px]"
          >
            {cp.navAccount}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/entrar" className="text-ink-soft hover:text-ink">
              {cp.navAccount}
            </Link>
            {clientPanelOk || accessOk ? (
              <Link href="/consulta" className="btn-primary !py-2 !px-3.5">
                {cp.openTool}
              </Link>
            ) : (
              <Link
                href="/entrar"
                className="rounded-full border border-ink/15 px-3.5 py-2 text-[13px]"
              >
                {cp.navAccount}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-5 py-12 md:py-16">
        <section>
          <p className="eyebrow">Clínica</p>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-5xl">
            {cp.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-ink-soft">
            {cp.intro}
          </p>
          {clientPanelOk && (
            <Link href="/consulta" className="btn-primary mt-6 inline-flex">
              {cp.openTool}
            </Link>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="display text-2xl">{cp.access}</h2>
            <div className="mt-4">
              <FirebaseAccount onUserChange={handleUserChange} />
            </div>
            {cloudMessage && (
              <p className="mt-2 text-[12px] text-sea-deep">{cloudMessage}</p>
            )}
            {user && (
              <button
                type="button"
                disabled={cloudBusy}
                onClick={migrate}
                className="mt-3 text-[12px] text-sea-deep underline"
              >
                Enviar histórico local para a nuvem
              </button>
            )}
            {!user && (
              <div className="mt-3 space-y-2 text-[13px] text-ink-soft">
                <p>
                  {cp.noAccount}{" "}
                  <Link href="/entrar" className="text-sea-deep underline">
                    {cp.noAccountLink}
                  </Link>
                </p>
                <p>
                  <Link href="/demo" className="text-sea-deep underline">
                    {cp.noAccountDemo}
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="display text-2xl">{cp.plan}</h2>
            {clinic ? (
              <div className="mt-4 rounded-xl border border-ink/10 bg-paper p-4 text-[13px]">
                <p className="font-medium text-ink">{clinic.name}</p>
                <p className="mt-1 text-ink-soft">
                  {ENVIRONMENT_LABELS[clinic.environment ?? "client"]} ·{" "}
                  {STATUS_LABELS[clinic.status]} · {PLAN_LABELS[clinic.plan]}
                </p>
                {clinic.trialEndsAt && clinic.status === "trial" && (
                  <p className="mt-1 text-ink-soft">
                    Trial até{" "}
                    {new Date(clinic.trialEndsAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {!accessOk && (
                  <p className="mt-3 text-warn">{cp.planSuspended}</p>
                )}
                {clinic.environment === "client" && (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={billingBusy || !user}
                        onClick={() => startCheckout("mensal")}
                        className="rounded-lg bg-sea-deep px-3 py-2 text-[12px] text-paper disabled:opacity-40"
                      >
                        Assinar mensal
                      </button>
                      <button
                        type="button"
                        disabled={billingBusy || !user}
                        onClick={() => startCheckout("anual")}
                        className="rounded-lg border border-sea/40 px-3 py-2 text-[12px] text-sea-deep disabled:opacity-40"
                      >
                        Assinar anual
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-ink-soft">
                      Checkout Stripe (quando configurado). Sem chaves, o admin
                      ainda pode ativar manualmente.
                    </p>
                  </>
                )}
              </div>
            ) : user ? (
              <div className="mt-4 rounded-xl border border-ink/10 bg-paper p-4 text-[13px] text-ink-soft">
                <p className="font-medium text-ink">{cp.noClinic}</p>
                <p className="mt-2">{cp.noClinicBody}</p>
                <Link href="/demo" className="mt-3 inline-block text-sea-deep underline">
                  {cp.noClinicLink}
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-ink-soft">
                {cp.noAccount}{" "}
                <Link href="/entrar" className="text-sea-deep underline">
                  {cp.noAccountLink}
                </Link>
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="display text-2xl">{cp.profile}</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  ["name", "Nome"],
                  ["registry", "Registro (CRM / outro)"],
                  ["clinic", "Clínica"],
                  ["city", "Cidade"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-ink-soft">
                  {label}
                  <input
                    value={profile[key]}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-sea"
                  />
                </label>
              ))}
              <button
                type="button"
                disabled={cloudBusy}
                onClick={persist}
                className="rounded-md bg-ink px-4 py-2.5 text-sm text-paper disabled:opacity-50"
              >
                Salvar perfil
              </button>
              {savedMsg && (
                <p className="text-xs text-sea">Perfil salvo.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <h2 className="display text-2xl">{cp.history}</h2>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={removeAll}
                  className="text-xs text-warn underline"
                >
                  Limpar tudo
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {history.length} sessão(ões). {cp.historyNote}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportHistoryJson(history)}
                className="rounded-lg border border-ink/10 px-3 py-1.5 text-[12px]"
              >
                Exportar JSON
              </button>
              <button
                type="button"
                onClick={() => exportHistoryCsv(history)}
                className="rounded-lg border border-ink/10 px-3 py-1.5 text-[12px]"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  exportTransferPack(history, profile.clinic || clinic?.name || "")
                }
                className="rounded-lg border border-sea/30 bg-sea/[0.06] px-3 py-1.5 text-[12px] text-sea-deep"
              >
                Pacote para prontuário
              </button>
              <button
                type="button"
                disabled={!zipConsent}
                onClick={async () => {
                  try {
                    const r = await exportHistoryZipWithPhotos(history);
                    setActionMsg(
                      `ZIP gerado: ${r.consultations} consultas, ${r.photoCount} arquivo(s) de foto.`,
                    );
                  } catch {
                    setActionMsg("Falha ao gerar ZIP.");
                  }
                }}
                className="rounded-lg border border-ink/10 px-3 py-1.5 text-[12px] disabled:opacity-40"
              >
                ZIP com fotos
              </button>
            </div>
            <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-soft">
              <input
                type="checkbox"
                checked={zipConsent}
                onChange={(e) => setZipConsent(e.target.checked)}
                className="mt-0.5 accent-sea"
              />
              {cp.zipConsent}
            </label>
            <ul className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto">
              {history.length === 0 && (
                <li className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-[14px] text-ink-soft">
                  Exporte um PDF na ferramenta para aparecer aqui.
                </li>
              )}
              {history.map((item) => {
                const scenario = SCENARIOS.find((s) => s.id === item.scenario);
                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-ink/10 bg-paper/90 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink">
                          {item.patientLabel || "Paciente sem rótulo"}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-soft">
                          {new Date(item.createdAt).toLocaleString("pt-BR")} ·{" "}
                          {scenario?.label}
                          {item.alignmentScore != null
                            ? ` · índice ${item.alignmentScore}`
                            : ""}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-soft">
                          Preferência: {preferenceLabel(item.preference)}
                          {item.patientAck ? " · confirmação ok" : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Link
                          href="/consulta"
                          onClick={() => stashReopenConsulta(item)}
                          className="text-[11px] text-sea-deep underline"
                        >
                          Reabrir
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeOne(item.id)}
                          className="text-[11px] text-ink-soft hover:text-warn"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {clinic && (
          <section className="rounded-2xl border border-ink/10 bg-paper p-6">
            <h2 className="display text-2xl">{cp.team}</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              {members.length} / {clinic.seats} assentos. {cp.teamNote}
            </p>
            <ul className="mt-4 space-y-2">
              {members.map((m) => (
                <li
                  key={m.uid}
                  className="flex justify-between text-[13px] text-ink-soft"
                >
                  <span>
                    {m.name || m.email} · {m.role}
                  </span>
                  <span className="text-[11px]">{m.email}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@clinica.com"
                className="rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const invite = await createMemberInvite({
                      clinicId: clinic.id,
                      clinicName: clinic.name,
                      email: inviteEmail,
                      role: "member",
                    });
                    setInviteLink(
                      `${window.location.origin}/entrar?invite=${invite.inviteId}`,
                    );
                    setActionMsg(
                      invite.emailSent
                        ? "Convite gerado e e-mail enviado."
                        : `Convite gerado. E-mail falhou${invite.emailReason ? ` (${invite.emailReason})` : ""} — envie o link manualmente.`,
                    );
                  } catch (err) {
                    setActionMsg(
                      err instanceof Error ? err.message : "Falha no convite.",
                    );
                  }
                }}
                className="btn-primary !py-2"
              >
                Gerar convite
              </button>
            </div>
            {inviteLink && (
              <p className="mt-3 break-all text-[12px] text-sea-deep">
                {inviteLink}
              </p>
            )}
          </section>
        )}

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-paper p-6">
            <h2 className="display text-2xl">{cp.support}</h2>
            <div className="mt-4 space-y-3">
              <input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Assunto"
                className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
              <textarea
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
                placeholder="Descreva o problema"
                rows={3}
                className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
              <button
                type="button"
                disabled={!user}
                onClick={async () => {
                  try {
                    await createTicket(ticketSubject, ticketBody);
                    setTicketSubject("");
                    setTicketBody("");
                    setTickets(await listMyTickets());
                    setActionMsg("Ticket enviado.");
                  } catch (err) {
                    setActionMsg(
                      err instanceof Error ? err.message : "Falha ao enviar.",
                    );
                  }
                }}
                className="btn-primary !py-2 disabled:opacity-40"
              >
                Abrir ticket
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {tickets.map((t) => (
                <li key={t.id} className="text-[12px] text-ink-soft">
                  {t.subject} · {t.status}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-warn/20 bg-warn/[0.04] p-6">
            <h2 className="display text-2xl text-ink">{cp.deleteAccount}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {cp.deleteAccountBody}
            </p>
            <button
              type="button"
              disabled={!user}
              onClick={async () => {
                if (
                  !window.confirm(
                    "Excluir sua conta Vislumbre definitivamente?",
                  )
                ) {
                  return;
                }
                try {
                  await deleteMyAccount();
                  clearHistory();
                  setHistory([]);
                  setUser(null);
                  setActionMsg("Conta excluída.");
                } catch (err) {
                  setActionMsg(
                    err instanceof Error ? err.message : "Falha na exclusão.",
                  );
                }
              }}
              className="mt-4 rounded-lg border border-warn/40 px-4 py-2 text-[13px] text-warn disabled:opacity-40"
            >
              Excluir minha conta
            </button>
          </div>
        </section>

        {actionMsg && (
          <p className="text-[13px] text-sea-deep">{actionMsg}</p>
        )}
      </main>
    </div>
  );
}

function mergeHistory(local: SavedConsulta[], cloud: SavedConsulta[]) {
  const byId = new Map<string, SavedConsulta>();
  [...local, ...cloud].forEach((entry) => byId.set(entry.id, entry));
  return [...byId.values()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 40);
}
