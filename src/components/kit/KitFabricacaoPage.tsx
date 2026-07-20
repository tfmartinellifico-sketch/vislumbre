"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const STEPS = [
  "Imprimir base FDM (PLA matte, ~18–22 cm)",
  "Prototipar 8 pads em TPE ou silicone Shore A 10–20",
  "Encapsular ímãs Ø6–8 mm (nunca expostos)",
  "Imprimir lâminas overlay em PET 0,2–0,3 mm",
  "Incluir cartão ético A5 + estojo",
  "Testar com 5 profissionais: utilidade vs só o app",
];

export function KitFabricacaoPage() {
  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/kit" className="text-[13px] text-sea-deep hover:underline">
            ← Kit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 md:py-20">
        <motion.div {...fade}>
          <p className="eyebrow">Fabricação v1</p>
          <h1 className="display mt-4 text-4xl tracking-tight md:text-5xl">
            Do arquivo à peça na clínica
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            Roteiro para produzir o kit Contorno. Spec completa em{" "}
            <code className="text-ink">docs/kit-fisico-v1.md</code> · CAD em{" "}
            <code className="text-ink">kit/cad/</code>.
          </p>
        </motion.div>

        <motion.ol {...fade} className="mt-12 space-y-4">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className="flex gap-4 rounded-xl border border-ink/10 bg-paper/90 px-5 py-4"
            >
              <span className="display text-xl text-sea-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[14px] leading-relaxed text-ink-soft">
                {step}
              </span>
            </li>
          ))}
        </motion.ol>

        <motion.div
          {...fade}
          className="mt-12 rounded-2xl border border-ink/10 bg-fog/80 p-6"
        >
          <h2 className="display text-xl">BOM alvo (hipótese)</h2>
          <ul className="mt-4 space-y-2 text-[14px] text-ink-soft">
            <li>COGS: R$ 110–225 por kit</li>
            <li>Preço sugerido clínica: R$ 390–890</li>
            <li>Fora do v1: punção, vasos, personalização 3D do paciente</li>
          </ul>
        </motion.div>

        <Link href="/kit" className="btn-primary mt-10 inline-flex">
          Voltar ao kit
        </Link>
      </main>
    </div>
  );
}
