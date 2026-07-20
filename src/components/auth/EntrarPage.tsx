"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Logo } from "@/components/brand/Logo";
import { FirebaseAccount } from "@/components/clinica/FirebaseAccount";
import {
  acceptInvite,
  loadClinic,
  loadInvite,
  loadMyClinicId,
} from "@/lib/platform";
import {
  isDemoClinic,
  postAuthDestination,
  type Clinic,
  type Invite,
} from "@/lib/platform-types";
import { ENTRAR_COPY } from "@/lib/landing-copy";

function EntrarInner() {
  const params = useSearchParams();
  const router = useRouter();
  const inviteId = params.get("invite");
  const [user, setUser] = useState<User | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasClinic, setHasClinic] = useState<boolean | null>(null);

  useEffect(() => {
    if (!inviteId) return;
    loadInvite(inviteId)
      .then(setInvite)
      .catch(() => setInvite(null));
  }, [inviteId]);

  useEffect(() => {
    if (!user) {
      setHasClinic(null);
      setClinic(null);
      return;
    }
    void (async () => {
      try {
        const id = await loadMyClinicId();
        setHasClinic(Boolean(id));
        if (id) setClinic(await loadClinic(id));
        else setClinic(null);
      } catch {
        setHasClinic(false);
        setClinic(null);
      }
    })();
  }, [user]);

  async function claimInvite() {
    if (!inviteId) return;
    setBusy(true);
    setMsg("");
    try {
      const clinicId = await acceptInvite(inviteId, name || "Profissional");
      const c = await loadClinic(clinicId);
      setClinic(c);
      setMsg("Convite aceito. Redirecionando…");
      router.push(postAuthDestination(c));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha ao aceitar convite.");
    } finally {
      setBusy(false);
    }
  }

  const demo = isDemoClinic(clinic);

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/demo" className="text-[13px] text-sea-deep">
            Solicitar demonstração
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-5 py-12">
        <h1 className="display text-3xl tracking-tight">{ENTRAR_COPY.title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          {invite
            ? ENTRAR_COPY.inviteIntro(invite.clinicName, invite.email)
            : ENTRAR_COPY.defaultIntro}
        </p>

        <div className="mt-8">
          <FirebaseAccount onUserChange={setUser} />
        </div>

        {user && invite && (
          <div className="mt-8 space-y-3 rounded-2xl border border-ink/10 bg-paper p-5">
            <label className="block text-[12px] text-ink-soft">
              Seu nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={claimInvite}
              className="btn-primary w-full disabled:opacity-40"
            >
              {ENTRAR_COPY.inviteButton}
            </button>
          </div>
        )}

        {user && !invite && hasClinic === true && (
          <div className="mt-8 flex flex-wrap gap-3">
            {demo ? (
              <Link href="/consulta" className="btn-primary">
                Abrir demonstração
              </Link>
            ) : (
              <>
                <Link href="/clinica" className="btn-primary">
                  Abrir painel da clínica
                </Link>
                <Link
                  href="/consulta"
                  className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px]"
                >
                  Abrir ferramenta
                </Link>
              </>
            )}
          </div>
        )}

        {user && !invite && hasClinic === false && (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-5 text-[14px] leading-relaxed text-ink-soft">
            <p className="font-medium text-ink">{ENTRAR_COPY.pendingTitle}</p>
            <p className="mt-2">{ENTRAR_COPY.pendingBody}</p>
            <Link href="/demo" className="mt-4 inline-block text-sea-deep underline">
              {ENTRAR_COPY.pendingCta}
            </Link>
          </div>
        )}

        {msg && <p className="mt-4 text-[13px] text-sea-deep">{msg}</p>}
      </main>
    </div>
  );
}

export function EntrarPage() {
  return (
    <Suspense fallback={<div className="p-10 text-ink-soft">Carregando…</div>}>
      <EntrarInner />
    </Suspense>
  );
}
