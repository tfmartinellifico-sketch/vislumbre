"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
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
import {
  logout,
  observeUser,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/firebase-cloud";
import { ENTRAR_COPY } from "@/lib/landing-copy";

function EntrarInner() {
  const params = useSearchParams();
  const inviteId = params.get("invite");

  if (inviteId) {
    return <InviteAcceptFlow inviteId={inviteId} />;
  }

  return <ClientLoginFlow />;
}

/** Fluxo único do convite: senha + ativação + redirecionamento. */
function InviteAcceptFlow({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadInvite(inviteId)
      .then((inv) => {
        if (!cancelled) setInvite(inv);
      })
      .catch(() => {
        if (!cancelled) setInvite(null);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteId]);

  useEffect(() => observeUser(setUser), []);

  const finishAccept = useCallback(
    async (displayName: string) => {
      const clinicId = await acceptInvite(inviteId, displayName || "Profissional");
      const c = await loadClinic(clinicId);
      setMsg("Acesso ativado. Abrindo a ferramenta…");
      router.replace(postAuthDestination(c));
    },
    [inviteId, router],
  );

  async function activate() {
    if (!invite) return;
    if (password.length < 6 && !user) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    setError("");
    setMsg("");
    try {
      if (!user) {
        try {
          await signUpWithEmail(invite.email, password);
        } catch (err) {
          const code =
            typeof err === "object" && err && "code" in err
              ? String(err.code)
              : "";
          if (code.includes("email-already-in-use")) {
            await signInWithEmail(invite.email, password);
          } else {
            throw err;
          }
        }
      } else if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
        setError(
          `Você está logado como ${user.email}. Saia e use o e-mail ${invite.email}.`,
        );
        setBusy(false);
        return;
      }
      await finishAccept(name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível ativar o acesso. Confira a senha e tente de novo.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (invite === undefined) {
    return (
      <Shell>
        <p className="text-[14px] text-ink-soft">Carregando convite…</p>
      </Shell>
    );
  }

  if (!invite) {
    return (
      <Shell>
        <h1 className="display text-3xl tracking-tight">Convite inválido</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Este link não é válido ou já expirou. Peça um novo convite à equipe
          Vislumbre.
        </p>
        <Link href="/demo" className="btn-primary mt-8 inline-flex">
          Solicitar demonstração
        </Link>
      </Shell>
    );
  }

  if (invite.usedAt) {
    return (
      <Shell>
        <h1 className="display text-3xl tracking-tight">Convite já utilizado</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Este convite já foi aceito. Entre com o e-mail {invite.email} para
          continuar.
        </p>
        <Link href="/entrar" className="btn-primary mt-8 inline-flex">
          Ir para o login
        </Link>
      </Shell>
    );
  }

  const wrongUser =
    user && user.email?.toLowerCase() !== invite.email.toLowerCase();

  return (
    <Shell>
      <p className="text-[11px] uppercase tracking-[0.22em] text-sea">
        Convite
      </p>
      <h1 className="display mt-2 text-3xl tracking-tight">
        Ative seu acesso
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        Você foi convidado(a) para <strong className="text-ink">{invite.clinicName}</strong>.
        Crie uma senha com o e-mail abaixo e entre na demonstração.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-paper p-5">
        <label className="block text-[12px] text-ink-soft">
          E-mail do convite
          <input
            type="email"
            value={invite.email}
            readOnly
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-fog/80 px-3 py-2.5 text-[13px] text-ink"
          />
        </label>
        <label className="block text-[12px] text-ink-soft">
          Seu nome
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como prefere ser chamado(a)"
            className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[13px] outline-none focus:border-sea"
          />
        </label>
        {!user && (
          <label className="block text-[12px] text-ink-soft">
            Crie uma senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[13px] outline-none focus:border-sea"
            />
          </label>
        )}

        {wrongUser && (
          <div className="rounded-xl border border-warn/30 bg-warn/[0.06] px-3 py-3 text-[13px] text-warn">
            <p>
              Você está logado como {user.email}. O convite é para{" "}
              {invite.email}.
            </p>
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => logout()}
            >
              Sair desta conta
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={busy || Boolean(wrongUser)}
          onClick={activate}
          className="btn-primary w-full !rounded-full disabled:opacity-40"
        >
          {busy
            ? "Ativando…"
            : user
              ? "Aceitar convite e continuar"
              : "Criar senha e entrar"}
        </button>

        {error && (
          <p className="text-[13px] leading-relaxed text-warn">{error}</p>
        )}
        {msg && (
          <p className="text-[13px] leading-relaxed text-sea-deep">{msg}</p>
        )}
      </div>
    </Shell>
  );
}

function ClientLoginFlow() {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [hasClinic, setHasClinic] = useState<boolean | null>(null);

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

  const demo = isDemoClinic(clinic);

  return (
    <Shell>
      <h1 className="display text-3xl tracking-tight">{ENTRAR_COPY.title}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {ENTRAR_COPY.defaultIntro}
      </p>

      <div className="mt-8">
        <FirebaseAccount onUserChange={setUser} defaultMode="login" />
      </div>

      {user && hasClinic === true && (
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

      {user && hasClinic === false && (
        <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-5 text-[14px] leading-relaxed text-ink-soft">
          <p className="font-medium text-ink">{ENTRAR_COPY.pendingTitle}</p>
          <p className="mt-2">{ENTRAR_COPY.pendingBody}</p>
          <Link href="/demo" className="mt-4 inline-block text-sea-deep underline">
            {ENTRAR_COPY.pendingCta}
          </Link>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
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
      <main className="mx-auto max-w-lg px-5 py-12">{children}</main>
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
