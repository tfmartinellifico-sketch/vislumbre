"use client";

import Link from "next/link";
import { Logo, type LogoFont } from "@/components/brand/Logo";

const FONTS: { id: LogoFont; label: string; note: string }[] = [
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    note: "Elegante, clínica premium. Padrão atual.",
  },
  {
    id: "instrument",
    label: "Instrument Serif",
    note: "Editorial, traço fino e contemporâneo.",
  },
  {
    id: "dm",
    label: "DM Serif Display",
    note: "Firme, legível, menos ornamentado.",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    note: "Orgânica, personalidade mais suave.",
  },
];

export function MarcaPage() {
  return (
    <div className="grain atmosphere min-h-screen px-5 py-16 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-[13px] text-sea-deep hover:underline">
          ← Voltar ao site
        </Link>
        <h1 className="display mt-8 text-4xl tracking-tight text-ink md:text-5xl">
          Tipografias do logo
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Compare as opções de fonte para a palavra Vislumbre. O símbolo (arco +
          contorno) permanece igual; só muda a tipografia.
        </p>

        <div className="mt-12 space-y-8">
          {FONTS.map((f) => (
            <article
              key={f.id}
              className="rounded-2xl border border-ink/10 bg-paper/90 p-8 shadow-[0_20px_50px_-40px_rgba(14,22,21,0.3)]"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-sea">
                {f.label}
              </p>
              <div className="mt-6 flex flex-wrap items-end gap-10">
                <Logo font={f.id} size="hero" />
                <Logo font={f.id} size="md" />
                <Logo font={f.id} markOnly size="lg" />
              </div>
              <p className="mt-5 text-[13px] text-ink-soft">{f.note}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[13px] text-ink-soft">
          O site usa <strong className="text-ink">Cormorant Garamond</strong> no
          logo por padrão. Se preferir outra, avise qual número da lista acima.
        </p>
      </div>
    </div>
  );
}
