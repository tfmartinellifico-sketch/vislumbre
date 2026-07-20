"use client";

import Link from "next/link";
import Image from "next/image";
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
          href="/demo"
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
          <Image
            src="/illustrations/ar-diagram.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
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
