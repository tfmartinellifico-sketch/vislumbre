"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  isFirebaseConfigured,
  logout,
  observeUser,
  resetPassword,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/firebase-cloud";

import { APP_COPY } from "@/lib/app-copy";

type Props = {
  onUserChange: (user: User | null) => void;
};

export function FirebaseAccount({ onUserChange }: Props) {
  const ac = APP_COPY.account;
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      observeUser((next) => {
        setUser(next);
        onUserChange(next);
      }),
    [onUserChange],
  );

  if (!isFirebaseConfigured) {
    return (
      <div className="rounded-lg border border-sand-deep/30 bg-sand/15 p-4">
        <p className="text-sm font-medium text-ink">{ac.unconfiguredTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          {ac.unconfiguredBody}
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-lg border border-sea/20 bg-sea/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">{ac.connected}</p>
            <p className="mt-1 text-xs text-ink-soft">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-md border border-ink/15 px-3 py-1.5 text-xs text-ink-soft"
          >
            Sair
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-sea-deep">
          {ac.syncNote}
        </p>
      </div>
    );
  }

  async function submit() {
    if (!email || password.length < 6) {
      setMessage("Informe e-mail e senha com pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (error) {
      setMessage(friendlyFirebaseError(error));
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    if (!email) {
      setMessage("Informe seu e-mail primeiro.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setMessage("E-mail de recuperação enviado.");
    } catch (error) {
      setMessage(friendlyFirebaseError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-paper/90 p-4">
      <div className="flex gap-2">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md px-3 py-1.5 text-xs ${
              mode === item ? "bg-sea-deep text-paper" : "text-ink-soft"
            }`}
          >
            {item === "login" ? ac.login : ac.signup}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu@email.com"
          className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-sea"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha (mín. 6 caracteres)"
          className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-sea"
        />
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm text-paper disabled:opacity-50"
        >
          {busy ? "Aguarde…" : mode === "login" ? ac.submitLogin : ac.submitSignup}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={recover}
          className="text-xs text-sea hover:underline"
        >
          {ac.forgot}
        </button>
        {message && <p className="text-xs text-warn">{message}</p>}
      </div>
    </div>
  );
}

function friendlyFirebaseError(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  if (code.includes("invalid-credential")) return "E-mail ou senha incorretos.";
  if (code.includes("email-already-in-use")) return "Este e-mail já possui conta.";
  if (code.includes("weak-password")) return "Use uma senha mais forte.";
  if (code.includes("too-many-requests")) return "Muitas tentativas. Aguarde um pouco.";
  return "Não foi possível concluir. Confira a configuração do Firebase.";
}
