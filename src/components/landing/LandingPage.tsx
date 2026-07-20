"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { HeroVisual } from "./HeroVisual";
import { ArSection } from "./ArSection";
import { RoadmapSection } from "./RoadmapSection";
import { LeadForm } from "./LeadForm";
import { SITE_COPY } from "@/lib/landing-copy";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-64px" },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
};

export function LandingPage() {
  const c = SITE_COPY;

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/6 bg-paper/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo href="/" size="md" />
          <nav className="flex items-center gap-4 text-[13px] text-ink-soft md:gap-6">
            <a href="#proposta" className="hidden hover:text-ink md:inline">
              {c.nav.proposta}
            </a>
            <a href="#ar" className="hidden hover:text-ink lg:inline">
              {c.nav.ar}
            </a>
            <a href="#status" className="hidden hover:text-ink lg:inline">
              {c.nav.status}
            </a>
            <Link href="/diferenca" className="hidden hover:text-ink md:inline">
              Diferenciação
            </Link>
            <Link href="/kit" className="hidden hover:text-ink sm:inline">
              Kit
            </Link>
            <Link href="/entrar" className="hidden hover:text-ink sm:inline">
              {c.nav.trial}
            </Link>
            <Link href="/consulta" className="btn-primary !rounded-full !py-2.5 !px-5">
              {c.nav.tool}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pt-[4.25rem]">
          <div className="pointer-events-none absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-sea/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-sand/[0.12] blur-3xl" />

          <div className="mx-auto grid max-w-7xl lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-14 md:px-10 lg:px-14 lg:py-20">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Logo size="hero" className="mb-8" />
              </motion.div>

              <motion.p
                className="max-w-md text-[clamp(1.25rem,3vw,1.65rem)] font-light leading-snug tracking-[-0.01em] text-ink"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
              >
                {c.brand.tagline}
              </motion.p>

              <motion.p
                className="mt-4 max-w-[32rem] text-[14px] font-medium text-sea-deep"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
              >
                {c.brand.subtitle}
              </motion.p>

              <motion.p
                className="mt-5 max-w-[32rem] text-[15px] leading-[1.75] text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {c.hero.lead}
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/consulta"
                  className="btn-primary !rounded-full !px-7 !py-3.5"
                >
                  {c.hero.ctaPrimary}
                </Link>
                <a href="#ar" className="btn-ghost !rounded-full">
                  {c.hero.ctaSecondary}
                </a>
              </motion.div>

              <motion.ul
                className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/10 pt-8 text-[12px] text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                {c.hero.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </motion.ul>
            </div>

            <div className="relative min-h-[44vh] lg:min-h-full">
              <HeroVisual />
            </div>
          </div>
        </section>

        <section id="proposta" className="section-pad border-t border-ink/8">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow">{c.proposta.eyebrow}</p>
            <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2 className="display text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05] tracking-tight text-ink">
                {c.proposta.title}
                <span className="mt-2 block text-ink-soft">
                  {c.proposta.titleAccent}
                </span>
              </h2>
              <p className="text-[15px] leading-[1.8] text-ink-soft lg:pb-2">
                {c.proposta.body}
              </p>
            </div>
          </motion.div>
        </section>

        <section id="partes" className="section-pad bg-ink text-paper">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow !text-sand">{c.organizacao.eyebrow}</p>
            <h2 className="display mt-4 max-w-lg text-4xl tracking-tight md:text-5xl">
              {c.organizacao.title}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist">
              {c.organizacao.intro}
            </p>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <article className="card-dark">
                <span className="text-[11px] uppercase tracking-[0.2em] text-sea-soft">
                  {c.organizacao.site.label}
                </span>
                <h3 className="display mt-4 text-3xl">{c.organizacao.site.title}</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-mist">
                  {c.organizacao.site.body}
                </p>
              </article>
              <article className="rounded-2xl bg-paper p-8 text-ink md:p-10">
                <span className="text-[11px] uppercase tracking-[0.2em] text-sea">
                  {c.organizacao.tool.label}
                </span>
                <h3 className="display mt-4 text-3xl">{c.organizacao.tool.title}</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                  {c.organizacao.tool.body}
                </p>
                <Link
                  href="/consulta"
                  className="btn-primary mt-8 !rounded-full"
                >
                  {c.organizacao.tool.cta}
                </Link>
              </article>
            </div>
          </motion.div>
        </section>

        <ArSection />

        <section className="section-pad atmosphere-dense border-t border-ink/8">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow">{c.fluxo.eyebrow}</p>
            <h2 className="display mt-4 max-w-md text-4xl tracking-tight md:text-5xl">
              {c.fluxo.title}
            </h2>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {c.fluxo.steps.map((item) => (
                <li key={item.n} className="step-card">
                  <span className="display text-[2.5rem] leading-none text-sea-soft">
                    {item.n}
                  </span>
                  <h3 className="mt-5 text-[18px] text-ink">{item.t}</h3>
                  <p className="mt-2.5 text-[14px] leading-[1.7] text-ink-soft">
                    {item.d}
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>
        </section>

        <section className="section-pad border-t border-ink/8">
          <motion.div
            {...fade}
            className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-xl">
              <p className="eyebrow">{c.kit.eyebrow}</p>
              <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
                {c.kit.title}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
                {c.kit.body}
              </p>
            </div>
            <Link
              href="/kit/fabricacao"
              className="text-[15px] font-medium text-sea-deep underline-offset-4 hover:underline"
            >
              {c.kit.link} →
            </Link>
          </motion.div>
        </section>

        <RoadmapSection />

        <section id="contato" className="section-pad border-t border-ink/8">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-start">
            <div>
              <p className="eyebrow">{c.contato.eyebrow}</p>
              <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
                {c.contato.title}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
                {c.contato.body}
              </p>
              <ul className="mt-6 space-y-2 text-[14px] text-ink-soft">
                {c.contato.benefits.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
            <LeadForm source="landing" />
          </div>
        </section>

        <section className="section-pad border-t border-ink/8 bg-fog">
          <motion.div
            {...fade}
            className="mx-auto flex max-w-6xl flex-col items-start gap-8 rounded-3xl border border-ink/8 bg-paper p-8 shadow-[0_32px_80px_-48px_rgba(14,22,21,0.25)] md:flex-row md:items-center md:justify-between md:p-12"
          >
            <div>
              <Logo size="lg" className="mb-4" />
              <h2 className="display text-3xl tracking-tight md:text-4xl">
                {c.ctaFinal.title}
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
                {c.ctaFinal.body}
              </p>
            </div>
            <Link
              href="/consulta"
              className="btn-primary !rounded-full !px-8 !py-4"
            >
              {c.ctaFinal.button}
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-ink/8 px-5 py-12 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo href="/" size="sm" />
          <nav className="flex flex-wrap gap-6 text-[13px] text-ink-soft">
            <Link href="/consulta" className="hover:text-ink">
              Demonstração
            </Link>
            <Link href="/kit" className="hover:text-ink">
              Kit
            </Link>
            <Link href="/#ar" className="hover:text-ink">
              AR na consulta
            </Link>
            <Link href="/sala" className="hover:text-ink">
              Sala de espera
            </Link>
            <Link href="/diferenca" className="hover:text-ink">
              Diferenciação
            </Link>
            <Link href="/#status" className="hover:text-ink">
              Disponibilidade
            </Link>
            <Link href="/entrar" className="hover:text-ink">
              Acesso clínica
            </Link>
            <Link href="/#contato" className="hover:text-ink">
              Contato
            </Link>
          </nav>
          <p className="text-[12px] text-ink-soft">{c.footer}</p>
        </div>
      </footer>
    </div>
  );
}
