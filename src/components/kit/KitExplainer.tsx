"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export function KitExplainer() {
  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Logo href="/" size="md" />
          <Link href="/demo" className="btn-primary !py-2.5 !px-4">
            Abrir ferramenta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <motion.div {...fade}>
          <p className="text-[11px] uppercase tracking-[0.26em] text-sea">
            Kit Contorno
          </p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-tight text-ink">
            Apoio tátil na mesa da consulta.
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.75] text-ink-soft">
            Base neutra e peças de volume para a clínica tangibilizar regiões
            já discutidas na ferramenta digital. Complemento opcional ao fluxo
            na mesa — sem simular procedimento nem substituir a avaliação
            clínica.
          </p>
        </motion.div>

        <motion.section {...fade} className="mt-16">
          <KitDiagram />
        </motion.section>

        <motion.section {...fade} className="mt-20 grid gap-10 md:grid-cols-2">
          <div className="border-t border-ink/12 pt-7">
            <h2 className="display text-3xl tracking-tight">O que entra na caixa</h2>
            <ul className="mt-6 space-y-4 text-[14px] leading-[1.7] text-ink-soft">
              <li>
                <strong className="text-ink">Base facial</strong> — rosto genérico
                leve, só para apoiar a conversa.
              </li>
              <li>
                <strong className="text-ink">Pads de volume</strong> — peças macias
                (malar, sulco, mento, mandíbula…) que se encaixam na base.
              </li>
              <li>
                <strong className="text-ink">Folhas transparentes</strong> — para
                colocar sobre a foto impressa, se quiser.
              </li>
              <li>
                <strong className="text-ink">Cartão de frases</strong> — lembretes
                para não soar como promessa de resultado.
              </li>
            </ul>
          </div>
          <div className="border-t border-ink/12 pt-7">
            <h2 className="display text-3xl tracking-tight">O que ele não é</h2>
            <ul className="mt-6 space-y-4 text-[14px] leading-[1.7] text-ink-soft">
              <li>Não é simulador de injeção nem boneco de treinamento.</li>
              <li>Não traz vasos, nervos, cânula nem pele em camadas.</li>
              <li>Não é a cópia 3D do rosto da paciente — isso fica na tela.</li>
              <li>Não prevê o resultado biológico do procedimento.</li>
            </ul>
          </div>
        </motion.section>

        <motion.section {...fade} className="mt-20">
          <h2 className="display text-3xl tracking-tight md:text-4xl">
            Como usar em quatro gestos
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              {
                n: "01",
                t: "Abra a ferramenta",
                d: "Foto da paciente e regiões marcadas no Vislumbre digital.",
              },
              {
                n: "02",
                t: "Escolha o pad",
                d: "Pegue a peça da mesma região (ex.: malar) e encaixe na base.",
              },
              {
                n: "03",
                t: "Compare volumes",
                d: "Pad fino = discreto. Pad grosso = o exagero a evitar.",
              },
              {
                n: "04",
                t: "Feche na tela",
                d: "Volte aos cenários ou ao modo paciente e registre a conversa.",
              },
            ].map((s) => (
              <li key={s.n} className="border-t border-sea/25 pt-5">
                <span className="display text-[2.5rem] leading-none text-sea-soft">
                  {s.n}
                </span>
                <h3 className="mt-4 text-[17px] text-ink">{s.t}</h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-ink-soft">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section
          {...fade}
          className="mt-20 rounded-2xl border border-ink/10 bg-fog/80 px-6 py-10 md:px-10"
        >
          <h2 className="display text-2xl tracking-tight md:text-3xl">
            Tela e mesa, juntos
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.75] text-ink-soft">
            A ferramenta digital mostra o rosto da paciente com cenários. O kit
            torna o volume tangível na mesa. Um não substitui o outro — e a
            ferramenta sozinha já fecha a consulta se o kit ainda não chegou.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo" className="btn-primary">
              Abrir a ferramenta
            </Link>
            <Link href="/kit/fabricacao" className="btn-ghost">
              Fabricação do kit
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function KitDiagram() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_20px_60px_-40px_rgba(14,22,21,0.35)]">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="relative min-h-[320px] atmosphere-dense p-8">
          <svg
            viewBox="0 0 360 320"
            className="mx-auto h-full w-full max-w-md"
            aria-hidden
          >
            <ellipse cx="160" cy="160" rx="88" ry="118" fill="#e4d2c0" opacity="0.95" />
            <text x="12" y="28" fill="#2a3836" fontSize="11" fontFamily="Georgia, serif">
              Base padronizada
            </text>
            <ellipse cx="125" cy="145" rx="28" ry="20" fill="#2f5f58" opacity="0.35" />
            <ellipse cx="195" cy="145" rx="28" ry="20" fill="#2f5f58" opacity="0.35" />
            <ellipse cx="160" cy="210" rx="36" ry="16" fill="#2f5f58" opacity="0.3" />
            <text x="98" y="148" fill="#1c3d39" fontSize="9">
              pad
            </text>
            <text x="168" y="148" fill="#1c3d39" fontSize="9">
              pad
            </text>
            <text x="140" y="214" fill="#1c3d39" fontSize="9">
              pad
            </text>
            <path
              d="M260 70 L300 70 L300 250 L260 250"
              fill="none"
              stroke="#2f5f58"
              strokeWidth="1"
              opacity="0.4"
            />
            <rect x="272" y="90" width="40" height="28" rx="4" fill="#7aa39a" opacity="0.5" />
            <rect x="272" y="130" width="40" height="28" rx="4" fill="#7aa39a" opacity="0.4" />
            <rect x="272" y="170" width="40" height="28" rx="4" fill="#9a4d2e" opacity="0.35" />
            <text x="268" y="80" fill="#2a3836" fontSize="9">
              estojo
            </text>
            <text x="276" y="188" fill="#9a4d2e" fontSize="7">
              exagero
            </text>
          </svg>
        </div>
        <div className="flex flex-col justify-center border-t border-ink/8 p-8 md:border-l md:border-t-0 md:p-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-sea">
            Na mesa
          </p>
          <h3 className="display mt-2 text-2xl tracking-tight">Leitura rápida</h3>
          <ol className="mt-6 space-y-3.5 text-[14px] text-ink-soft">
            <li>
              <span className="text-ink">A.</span> Base = território neutro
            </li>
            <li>
              <span className="text-ink">B.</span> Pads em verde = volumes possíveis
            </li>
            <li>
              <span className="text-ink">C.</span> Pad em terracota = o que se evita
            </li>
            <li>
              <span className="text-ink">D.</span> Tela = rosto da paciente
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
