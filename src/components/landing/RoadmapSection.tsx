"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const ITEMS = [
  { label: "Ferramenta de consulta", status: "done", note: "Fluxo completo no ar" },
  { label: "Leads + painel admin", status: "done", note: "/admin · e-mail Resend" },
  { label: "Clínicas, trial e convites", status: "done", note: "Assentos + e-mail" },
  { label: "Bloqueio trial/suspensa", status: "done", note: "Ferramenta trava de verdade" },
  { label: "Export JSON/CSV/ZIP/prontuário", status: "done", note: "Em /clinica" },
  { label: "Checkout Stripe", status: "done", note: "Webhook → active/suspended" },
  { label: "Kit físico fabricado", status: "next", note: "Spec pronta — fora do código" },
];

export function RoadmapSection() {
  return (
    <section id="status" className="section-pad border-t border-ink/8 bg-paper">
      <motion.div {...fade} className="mx-auto max-w-6xl">
        <p className="eyebrow">Onde estamos</p>
        <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          Feito e o que vem depois
        </h2>
        <ul className="mt-12 grid gap-3 md:grid-cols-2">
          {ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-ink/10 bg-fog/50 px-4 py-3.5"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.status === "done" ? "bg-sea" : "bg-ink/25"
                }`}
              />
              <div>
                <p className="text-[14px] font-medium text-ink">{item.label}</p>
                <p className="mt-0.5 text-[12px] text-ink-soft">{item.note}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[13px] text-ink-soft">
          Sala de espera:{" "}
          <Link href="/sala" className="text-sea-deep underline">
            /sala
          </Link>
          {" · "}
          Admin:{" "}
          <Link href="/admin" className="text-sea-deep underline">
            /admin
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
