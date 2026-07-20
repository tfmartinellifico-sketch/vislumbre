"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { HeroVisual } from "./HeroVisual";
import { ArSection } from "./ArSection";
import { RoadmapSection } from "./RoadmapSection";
import { LeadForm } from "./LeadForm";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-64px" },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
};

export function LandingPage() {
  return (
    <div className="grain atmosphere min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/6 bg-paper/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo href="/" size="md" />
          <nav className="flex items-center gap-4 text-[13px] text-ink-soft md:gap-6">
            <a href="#proposta" className="hidden hover:text-ink md:inline">
              Proposta
            </a>
            <a href="#ar" className="hidden hover:text-ink lg:inline">
              AR
            </a>
            <a href="#status" className="hidden hover:text-ink lg:inline">
              Status
            </a>
            <Link href="/diferenca" className="hidden hover:text-ink md:inline">
              Diferença
            </Link>
            <Link href="/kit" className="hidden hover:text-ink sm:inline">
              Kit
            </Link>
            <Link href="/entrar" className="hidden hover:text-ink sm:inline">
              Trial / entrar
            </Link>
            <Link href="/consulta" className="btn-primary !rounded-full !py-2.5 !px-5">
              Abrir ferramenta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
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
                Clareza antes da decisão.
              </motion.p>

              <motion.p
                className="mt-5 max-w-[30rem] text-[15px] leading-[1.75] text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                Ferramenta para a consulta de estética facial: foto, cenários de
                volume, visualização ao vivo e registro — sempre deixando claro o
                que é possível e o que não se promete.
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
                  Entrar na ferramenta
                </Link>
                <a href="#ar" className="btn-ghost !rounded-full">
                  Entender o AR
                </a>
              </motion.div>

              <motion.ul
                className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/10 pt-8 text-[12px] text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <li>Sem cadastro obrigatório</li>
                <li>Fotos ficam no aparelho</li>
                <li>PDF com avisos claros</li>
              </motion.ul>
            </div>

            <div className="relative min-h-[44vh] lg:min-h-full">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* Proposta */}
        <section id="proposta" className="section-pad border-t border-ink/8">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow">A proposta</p>
            <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2 className="display text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05] tracking-tight text-ink">
                Menos expectativa irreal.
                <span className="mt-2 block text-ink-soft">
                  Mais conversa bem feita.
                </span>
              </h2>
              <p className="text-[15px] leading-[1.8] text-ink-soft lg:pb-2">
                O Vislumbre não existe para “vender o after”. Existe para que a
                paciente entenda o plano, veja alternativas e compreenda limites —
                com linguagem visual clara e responsabilidade clínica.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Site × Ferramenta */}
        <section id="partes" className="section-pad bg-ink text-paper">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow !text-sand">Organização</p>
            <h2 className="display mt-4 max-w-lg text-4xl tracking-tight md:text-5xl">
              Site e ferramenta
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist">
              Dois ambientes, uma marca. Este site apresenta; a ferramenta é onde
              você trabalha com a paciente.
            </p>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <article className="card-dark">
                <span className="text-[11px] uppercase tracking-[0.2em] text-sea-soft">
                  Você está aqui
                </span>
                <h3 className="display mt-4 text-3xl">Site</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-mist">
                  Proposta, kit físico, explicação do AR e postura ética. A
                  vitrine para clínicas e parceiros.
                </p>
              </article>
              <article className="rounded-2xl bg-paper p-8 text-ink md:p-10">
                <span className="text-[11px] uppercase tracking-[0.2em] text-sea">
                  Onde se trabalha
                </span>
                <h3 className="display mt-4 text-3xl">Ferramenta</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                  Registro, análise, cenários, AR ao vivo, kit na mesa e PDF da
                  conversa.
                </p>
                <Link
                  href="/consulta"
                  className="btn-primary mt-8 !rounded-full"
                >
                  Abrir consulta
                </Link>
              </article>
            </div>
          </motion.div>
        </section>

        <ArSection />

        {/* Fluxo */}
        <section className="section-pad atmosphere-dense border-t border-ink/8">
          <motion.div {...fade} className="mx-auto max-w-6xl">
            <p className="eyebrow">Na prática</p>
            <h2 className="display mt-4 max-w-md text-4xl tracking-tight md:text-5xl">
              Da foto ao alinhamento
            </h2>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Registrar",
                  d: "Foto frontal com moldura guiada. Perfil quando a projeção importa.",
                },
                {
                  n: "02",
                  t: "Mostrar",
                  d: "Três cenários na foto e, se quiser, ao vivo na câmera.",
                },
                {
                  n: "03",
                  t: "Registrar",
                  d: "Modo paciente, kit tátil e PDF com os avisos necessários.",
                },
              ].map((item) => (
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

        {/* Kit */}
        <section className="section-pad border-t border-ink/8">
          <motion.div
            {...fade}
            className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-xl">
              <p className="eyebrow">Kit físico</p>
              <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
                Volume na mão
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
                Base neutra e peças de volume para a mesa. Apoio tátil à mesma
                conversa da tela — opcional, mas diferenciado.
              </p>
            </div>
            <Link
              href="/kit/fabricacao"
              className="text-[15px] font-medium text-sea-deep underline-offset-4 hover:underline"
            >
              Roteiro de fabricação →
            </Link>
          </motion.div>
        </section>

        <RoadmapSection />

        <section id="contato" className="section-pad border-t border-ink/8">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-start">
            <div>
              <p className="eyebrow">Para clínicas</p>
              <h2 className="display mt-4 text-4xl tracking-tight md:text-5xl">
                Quer piloto ou demonstração?
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
                Deixe seus dados. Entramos em contato para liberar trial,
                agendar demo ou ativar a clínica.
              </p>
              <ul className="mt-6 space-y-2 text-[14px] text-ink-soft">
                <li>· Trial de 14 dias com criação de conta</li>
                <li>· Convite de equipe na mesma clínica</li>
                <li>· Exportação do histórico para o prontuário</li>
              </ul>
            </div>
            <LeadForm source="landing" />
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad border-t border-ink/8 bg-fog">
          <motion.div
            {...fade}
            className="mx-auto flex max-w-6xl flex-col items-start gap-8 rounded-3xl border border-ink/8 bg-paper p-8 shadow-[0_32px_80px_-48px_rgba(14,22,21,0.25)] md:flex-row md:items-center md:justify-between md:p-12"
          >
            <div>
              <Logo size="lg" className="mb-4" />
              <h2 className="display text-3xl tracking-tight md:text-4xl">
                Experimente na próxima consulta
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
                Use a face demonstrativa e percorra o fluxo completo — foto,
                cenários, AR e PDF.
              </p>
            </div>
            <Link
              href="/consulta"
              className="btn-primary !rounded-full !px-8 !py-4"
            >
              Abrir ferramenta
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-ink/8 px-5 py-12 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo href="/" size="sm" />
          <nav className="flex flex-wrap gap-6 text-[13px] text-ink-soft">
            <Link href="/consulta" className="hover:text-ink">
              Ferramenta
            </Link>
            <Link href="/kit" className="hover:text-ink">
              Kit
            </Link>
            <Link href="/#ar" className="hover:text-ink">
              AR
            </Link>
            <Link href="/sala" className="hover:text-ink">
              Sala de espera
            </Link>
            <Link href="/diferenca" className="hover:text-ink">
              Diferença
            </Link>
            <Link href="/#status" className="hover:text-ink">
              Status
            </Link>
            <Link href="/entrar" className="hover:text-ink">
              Entrar
            </Link>
            <Link href="/#contato" className="hover:text-ink">
              Contato
            </Link>
          </nav>
          <p className="text-[12px] text-ink-soft">
            Demonstração para conversa · sem garantia de resultado
          </p>
        </div>
      </footer>
    </div>
  );
}
