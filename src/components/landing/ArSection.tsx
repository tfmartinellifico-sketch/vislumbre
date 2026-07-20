"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AR_COPY } from "@/lib/landing-copy";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export function ArSection() {
  const c = AR_COPY;

  return (
    <section id="ar" className="border-t border-ink/10 bg-ink px-5 py-24 text-paper md:px-10">
      <motion.div {...fade} className="mx-auto max-w-6xl">
        <p className="text-[11px] uppercase tracking-[0.26em] text-sand">
          {c.eyebrow}
        </p>
        <h2 className="display mt-4 max-w-2xl text-4xl leading-tight tracking-tight md:text-[3.25rem]">
          {c.title}
        </h2>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-mist">
          {c.intro}
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            {c.steps.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 border-l border-paper/15 pl-5"
              >
                <span className="display text-2xl text-sea-soft">{step.n}</span>
                <div>
                  <h3 className="text-[17px] text-paper">{step.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-mist">
                    {step.d}
                  </p>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-paper/12 bg-paper/[0.05] p-5">
              <p className="text-[13px] font-medium text-sand">{c.xrNote.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                {c.xrNote.body}
              </p>
            </div>
          </div>

          <ArDiagram />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-sea-soft/30 bg-sea/10 p-5">
            <p className="text-[12px] uppercase tracking-[0.16em] text-sea-soft">
              O recurso é
            </p>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-mist">
              {c.is.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-warn/30 bg-warn/10 p-5">
            <p className="text-[12px] uppercase tracking-[0.16em] text-sand">
              O recurso não é
            </p>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-mist">
              {c.isNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/consulta"
          className="btn-primary mt-10 inline-flex !bg-paper !text-ink hover:!bg-mist"
        >
          {c.cta}
        </Link>
      </motion.div>
    </section>
  );
}

function ArDiagram() {
  const c = AR_COPY;

  return (
    <div className="overflow-hidden rounded-2xl border border-paper/10 bg-paper/[0.04]">
      <div className="relative aspect-[4/5] max-h-[480px] bg-gradient-to-b from-sea-deep to-ink">
        <div className="absolute inset-6 overflow-hidden rounded-[1.75rem] border border-paper/15 bg-ink/40">
          <svg
            viewBox="0 0 280 360"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="arSkin" x1="0.3" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stopColor="#f0e2d4" />
                <stop offset="100%" stopColor="#d4b89a" />
              </linearGradient>
              <radialGradient id="arVol" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7aa39a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7aa39a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Perfil ¾ — sem olhar frontal */}
            <path
              d="M95 145 C98 100, 118 78, 145 72 C170 68, 195 82, 205 115 C210 140, 212 165, 208 185 C218 198, 222 215, 220 235 C218 250, 210 262, 198 270 C206 278, 208 290, 204 302 C198 320, 180 335, 155 342 C130 348, 105 338, 95 315 C88 290, 90 250, 92 210 C93 180, 93 160, 95 145 Z"
              fill="url(#arSkin)"
              opacity="0.92"
            />
            <path
              d="M168 145 Q182 138, 195 145"
              fill="none"
              stroke="#5c4a3e"
              strokeWidth="1.3"
              opacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M172 158 Q185 154, 196 160"
              fill="none"
              stroke="#5c4a3e"
              strokeWidth="1.2"
              opacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M198 165 C205 185, 208 205, 204 222 C200 228, 192 230, 188 226"
              fill="none"
              stroke="#9a7358"
              strokeWidth="1.1"
              opacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M185 268 C195 272, 202 278, 205 284"
              fill="none"
              stroke="#b87870"
              strokeWidth="1.5"
              opacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M170 210 C185 205, 200 215, 202 232 C198 248, 178 250, 165 240 C162 225, 165 215, 170 210 Z"
              fill="url(#arVol)"
              stroke="#6b9a90"
              strokeWidth="0.8"
              strokeDasharray="4 3"
            />
            <path
              d="M130 300 C155 295, 185 305, 190 322 C175 335, 145 338, 125 328 C122 315, 125 305, 130 300 Z"
              fill="url(#arVol)"
              stroke="#6b9a90"
              strokeWidth="0.7"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <ellipse
              cx="140"
              cy="200"
              rx="78"
              ry="105"
              fill="none"
              stroke="rgba(250,252,251,0.45)"
              strokeWidth="1.1"
              strokeDasharray="5 4"
            />
            {[
              [175, 220],
              [190, 235],
              [155, 315],
              [175, 325],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" fill="#6b9a90" opacity="0.7" />
            ))}
          </svg>
          <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] text-mist">{c.diagramCaption}</p>
          </div>
        </div>
        <p className="absolute left-8 top-8 text-[10px] uppercase tracking-[0.2em] text-sand">
          Modo ao vivo
        </p>
      </div>
      <p className="border-t border-paper/10 px-5 py-4 text-[12px] leading-relaxed text-mist">
        {c.diagramFooter}
      </p>
    </div>
  );
}
