"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { isFirebaseConfigured } from "@/lib/firebase";
import { submitLead } from "@/lib/platform";
import { DEMO_COPY } from "@/lib/landing-copy";

export function DemoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError(DEMO_COPY.form.errorUnavailable);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitLead({
        name,
        email,
        company,
        clinic: company,
        source: "demo",
        requestDemo: true,
        message: "Solicitação de acesso ao ambiente de demonstração.",
      });
      setDone(true);
    } catch {
      setError(DEMO_COPY.form.errorSend);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/entrar" className="text-[13px] text-sea-deep">
            Área do cliente
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sea">{DEMO_COPY.eyebrow}</p>
        <h1 className="display mt-3 text-4xl tracking-tight text-ink md:text-5xl">
          {DEMO_COPY.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-soft">
          {DEMO_COPY.intro}
        </p>

        <ul className="mt-8 space-y-3 border-l border-ink/12 pl-5 text-[14px] leading-relaxed text-ink-soft">
          {DEMO_COPY.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-ink/10 bg-paper p-6 md:p-8">
          <h2 className="display text-2xl tracking-tight">{DEMO_COPY.formTitle}</h2>
          <p className="mt-2 text-[14px] text-ink-soft">{DEMO_COPY.formIntro}</p>

          {done ? (
            <div className="mt-8 rounded-xl border border-sea/25 bg-sea/[0.06] p-6 text-center">
              <p className="display text-xl text-ink">{DEMO_COPY.successTitle}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                {DEMO_COPY.successBody}
              </p>
              <Link href="/" className="btn-primary mt-6 inline-flex !rounded-full">
                Voltar ao site
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block text-[12px] text-ink-soft">
                Nome
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[13px] outline-none focus:border-sea"
                />
              </label>
              <label className="block text-[12px] text-ink-soft">
                E-mail profissional
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[13px] outline-none focus:border-sea"
                />
              </label>
              <label className="block text-[12px] text-ink-soft">
                Empresa / clínica
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[13px] outline-none focus:border-sea"
                />
              </label>
              {error && <p className="text-[13px] text-warn">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary !rounded-full disabled:opacity-40"
              >
                {busy ? DEMO_COPY.formBusy : DEMO_COPY.formSubmit}
              </button>
              <p className="text-[11px] text-ink-soft">{DEMO_COPY.privacy}</p>
            </form>
          )}
        </div>

        <p className="mt-10 text-center text-[13px] text-ink-soft">
          Já tem acesso liberado?{" "}
          <Link href="/entrar" className="text-sea-deep underline">
            Entrar na área do cliente
          </Link>
        </p>
      </main>
    </div>
  );
}
