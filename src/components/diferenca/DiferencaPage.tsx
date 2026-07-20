"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { DIFERENCA_COPY } from "@/lib/landing-copy";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const COMPARISON = [
  {
    vislumbre: "Ilustração para alinhar expectativa na consulta",
    other: "Prévia com aparência de resultado final",
  },
  {
    vislumbre: "Três intensidades, incluindo exagero a evitar",
    other: "Ênfase em “como ficará”",
  },
  {
    vislumbre: "Avisos em tela, câmera ao vivo e PDF",
    other: "Risco de confundir com before-and-after",
  },
  {
    vislumbre: "Sem dose, produto ou simulação de procedimento",
    other: "Simulação de preenchimento ou intervenção",
  },
];

export function DiferencaPage() {
  const c = DIFERENCA_COPY;

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/consulta" className="btn-primary !rounded-full !py-2 !px-4">
            Demonstração
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
          <motion.div {...fade}>
            <p className="eyebrow">Diferenciação</p>
            <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.05] tracking-tight text-ink">
              {c.hero.title}
              <span className="mt-2 block text-ink-soft">{c.hero.accent}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-[16px] leading-[1.8] text-ink-soft">
              {c.hero.body}
            </p>
          </motion.div>

          <motion.div {...fade} className="mt-16 grid gap-5 md:grid-cols-3">
            {c.pillars.map((p) => (
              <article
                key={p.t}
                className="rounded-2xl border border-ink/10 bg-paper/90 p-6"
              >
                <h2 className="display text-xl tracking-tight text-ink">{p.t}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {p.d}
                </p>
              </article>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-ink/8 bg-ink px-5 py-20 text-paper md:px-10">
          <motion.div {...fade} className="mx-auto max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.26em] text-sand">
              Comparativo
            </p>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              Vislumbre × simuladores de resultado
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
              {c.compareIntro}
            </p>

            <div className="mt-12 overflow-hidden rounded-2xl border border-paper/12">
              <div className="grid grid-cols-2 bg-paper/10 text-[12px] uppercase tracking-[0.14em]">
                <div className="px-5 py-3.5 text-sand">Vislumbre</div>
                <div className="border-l border-paper/12 px-5 py-3.5 text-mist/70">
                  Simuladores típicos
                </div>
              </div>
              {COMPARISON.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 border-t border-paper/10 text-[14px] leading-relaxed"
                >
                  <div className="px-5 py-4 text-paper">{row.vislumbre}</div>
                  <div className="border-l border-paper/10 px-5 py-4 text-mist/80">
                    {row.other}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20 md:px-10">
          <motion.div {...fade}>
            <p className="eyebrow">Para a clínica</p>
            <h2 className="display mt-3 max-w-xl text-3xl tracking-tight md:text-4xl">
              {c.clinic.title}
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {c.clinic.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-ink/10 bg-fog/60 px-4 py-4 text-[14px] leading-relaxed text-ink-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sea" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-14 flex flex-wrap gap-3">
              <Link href="/consulta" className="btn-primary !rounded-full">
                Acessar demonstração
              </Link>
              <Link href="/#contato" className="btn-ghost !rounded-full">
                Solicitar piloto
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
