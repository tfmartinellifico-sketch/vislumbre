"use client";

import { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { submitLead } from "@/lib/platform";

export function LeadForm({ source = "site" }: { source?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clinic, setClinic] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError("Formulário temporariamente indisponível. Escreva para o e-mail de contato.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitLead({ name, email, phone, clinic, city, message, source });
      setDone(true);
    } catch {
      setError("Não foi possível enviar. Tente de novo em instantes.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sea/25 bg-sea/[0.06] p-8 text-center">
        <p className="display text-2xl text-ink">Recebemos seu interesse</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Em breve entraremos em contato para agendar uma demonstração ou liberar
          o piloto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" value={name} onChange={setName} required />
        <Field label="E-mail" value={email} onChange={setEmail} type="email" required />
        <Field label="Telefone / WhatsApp" value={phone} onChange={setPhone} />
        <Field label="Clínica / consultório" value={clinic} onChange={setClinic} />
        <Field label="Cidade" value={city} onChange={setCity} />
      </div>
      <label className="block text-[12px] text-ink-soft">
        Mensagem
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-sea"
          placeholder="Quero conhecer o piloto / agendar demo…"
        />
      </label>
      {error && <p className="text-[13px] text-warn">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary !rounded-full disabled:opacity-40">
        {busy ? "Enviando…" : "Quero ser contatado"}
      </button>
      <p className="text-[11px] text-ink-soft">
        Usamos seus dados só para retorno comercial. Sem spam.
      </p>
    </form>
  );
}

function Field({
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
        className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-sea"
      />
    </label>
  );
}
