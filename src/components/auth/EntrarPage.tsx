"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Logo } from "@/components/brand/Logo";
import { FirebaseAccount } from "@/components/clinica/FirebaseAccount";
import {
  acceptInvite,
  createClinicOnSignup,
  loadInvite,
} from "@/lib/platform";
import type { Invite } from "@/lib/platform-types";

function EntrarInner() {
  const params = useSearchParams();
  const router = useRouter();
  const inviteId = params.get("invite");
  const [user, setUser] = useState<User | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [name, setName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!inviteId) return;
    loadInvite(inviteId)
      .then(setInvite)
      .catch(() => setInvite(null));
  }, [inviteId]);

  async function claimInvite() {
    if (!inviteId) return;
    setBusy(true);
    setMsg("");
    try {
      await acceptInvite(inviteId, name || "Profissional");
      setMsg("Convite aceito. Redirecionando…");
      router.push("/clinica");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha ao aceitar convite.");
    } finally {
      setBusy(false);
    }
  }

  async function selfServeClinic() {
    setBusy(true);
    setMsg("");
    try {
      await createClinicOnSignup({
        clinicName: clinicName || "Minha clínica",
        city,
        ownerName: name || "Profissional",
      });
      setMsg("Clínica criada em trial de 14 dias.");
      router.push("/clinica");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha ao criar clínica.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/consulta" className="text-[13px] text-sea-deep">
            Ferramenta
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-5 py-12">
        <h1 className="display text-3xl tracking-tight">Entrar no Vislumbre</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          {invite
            ? `Convite para ${invite.clinicName} (${invite.email}). Cadastre-se ou entre com este e-mail.`
            : "Crie sua conta, inicie o trial ou aceite um convite da sua clínica."}
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
              Aceitar convite e entrar na clínica
            </button>
          </div>
        )}

        {user && !invite && (
          <div className="mt-8 space-y-3 rounded-2xl border border-ink/10 bg-paper p-5">
            <p className="text-[13px] font-medium text-ink">
              Abrir clínica em trial (14 dias)
            </p>
            <label className="block text-[12px] text-ink-soft">
              Seu nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
            </label>
            <label className="block text-[12px] text-ink-soft">
              Nome da clínica
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
            </label>
            <label className="block text-[12px] text-ink-soft">
              Cidade
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px]"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={selfServeClinic}
              className="btn-primary w-full disabled:opacity-40"
            >
              Começar trial
            </button>
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
