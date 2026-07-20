"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const ITEMS = [
  { label: "Ferramenta completa de consulta", status: "done", note: "Foto → análise → cenários → AR → PDF" },
  { label: "Guardrails visuais éticos", status: "done", note: "Volumes ilustrativos + avisos" },
  { label: "Preferência da paciente + assinatura", status: "done", note: "Registro do que ela verbalizou" },
  { label: "Índice de alinhamento", status: "done", note: "Lembrete da conversa, não nota clínica" },
  { label: "Cartão sala de espera", status: "done", note: "/sala — imprimível" },
  { label: "Kit físico fabricado", status: "next", note: "Spec pronta · produção pendente" },
  { label: "Publicação online", status: "next", note: "Guia Vercel em docs/" },
  { label: "Revisão jurídica", status: "next", note: "Termos ainda são rascunho" },
];

export function RoadmapSection() {
  return (
    <section id="status" className="section-pad border-t border-ink/8 bg-paper">
      <motion.div {...fade} className="mx-auto max-w-6xl">
        <p className="eyebrow">Onde estamos</p>
        <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          Feito e o que vem depois
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Transparência do que já funciona na ferramenta e do que ainda depende
          de produção, publicação ou assessoria.
        </p>

        <ul className="mt-12 grid gap-3 md:grid-cols-2">
          {ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-ink/10 bg-fog/50 px-4 py-3.5"
            >
              <StatusDot status={item.status} />
              <div>
                <p className="text-[14px] font-medium text-ink">{item.label}</p>
                <p className="mt-0.5 text-[12px] text-ink-soft">{item.note}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[13px] text-ink-soft">
          Material para a sala de espera:{" "}
          <Link href="/sala" className="text-sea-deep underline-offset-2 hover:underline">
            /sala
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors = {
    done: "bg-sea",
    next: "bg-ink/25",
  };
  return (
    <span
      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[status as keyof typeof colors] ?? "bg-ink/25"}`}
    />
  );
}
