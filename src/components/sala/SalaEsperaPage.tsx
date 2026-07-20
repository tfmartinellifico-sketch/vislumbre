"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Cartão para sala de espera — diferencial de comunicação pré-consulta. */
export function SalaEsperaPage() {
  return (
    <div className="min-h-screen bg-fog print:bg-white">
      <div className="mx-auto max-w-2xl px-5 py-10 print:py-6 md:px-8">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Logo href="/" size="sm" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary !py-2 !px-4"
            >
              Imprimir
            </button>
            <Link href="/" className="btn-ghost !py-2 !px-4">
              Site
            </Link>
          </div>
        </div>

        <p className="mb-4 text-[12px] text-ink-soft print:hidden">
          Material para a clínica disponibilizar ao paciente na sala de espera.
          Imprima e personalize com o nome da clínica, se desejar.
        </p>

        <article className="rounded-3xl border border-ink/10 bg-paper p-8 shadow-[0_24px_60px_-40px_rgba(14,22,21,0.3)] print:shadow-none md:p-12">
          <Logo size="lg" className="mb-8" />
          <h1 className="display text-3xl tracking-tight text-ink md:text-4xl">
            Antes da conversa com o profissional
          </h1>
          <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
            Nesta consulta usamos o <strong className="text-ink">Vislumbre</strong> —
            uma ferramenta visual para explicar possibilidades e limites. O que
            você verá na tela é uma <strong className="text-ink">demonstração
            para conversa</strong>, não o resultado do procedimento.
          </p>

          <ol className="mt-10 space-y-6">
            {[
              {
                n: "1",
                t: "Foto e regiões",
                d: "O profissional registra o rosto e indica as áreas da conversa.",
              },
              {
                n: "2",
                t: "Três intensidades",
                d: "Discreta, equilibrada e uma exagerada — esta última mostra o que se evita.",
              },
              {
                n: "3",
                t: "Sua preferência",
                d: "Você pode indicar o que faz mais sentido para você. Nada disso é garantia.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4 border-t border-ink/10 pt-5">
                <span className="display text-2xl text-sea-soft">{s.n}</span>
                <div>
                  <h2 className="text-[17px] text-ink">{s.t}</h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-xl border border-warn/25 bg-warn/[0.05] px-4 py-4 text-[13px] leading-relaxed text-warn">
            O resultado real depende da avaliação clínica, da anatomia, da
            técnica e do tempo. Nenhuma imagem substitui o exame e o
            consentimento informado.
          </div>

          <p className="mt-8 text-[12px] text-ink-soft">
            Vislumbre · Clareza antes da decisão
          </p>
        </article>
      </div>
    </div>
  );
}
