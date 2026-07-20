"use client";

import { motion } from "framer-motion";

type Props = {
  onClose: () => void;
};

export function Onboarding({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-[2px] sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel w-full max-w-lg p-7 md:p-8"
      >
        <p className="text-[11px] uppercase tracking-[0.22em] text-sea">
          Bem-vindo
        </p>
        <h2 className="display mt-2 text-3xl tracking-tight text-ink">
          Como usar o Vislumbre na consulta
        </h2>
        <ol className="mt-6 space-y-4 text-[14px] leading-[1.65] text-ink-soft">
          <li>
            <strong className="text-ink">Registro</strong> — foto frontal (e perfil,
            se precisar explicar projeção).
          </li>
          <li>
            <strong className="text-ink">Análise</strong> — marque regiões ou escolha
            um roteiro pronto.
          </li>
          <li>
            <strong className="text-ink">Cenários</strong> — mostre o discreto, o
            equilibrado e o exagerado.
          </li>
          <li>
            <strong className="text-ink">Ao vivo / Kit</strong> — câmera ou peças na
            mesa, se tiver.
          </li>
          <li>
            <strong className="text-ink">Registro final</strong> — PDF com o que foi
            conversado e os avisos.
          </li>
        </ol>
        <p className="mt-6 rounded-lg border border-warn/25 bg-warn/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-warn">
          Nunca apresente as imagens como resultado garantido. O cenário
          exagerado existe justamente para alinhar expectativa.
        </p>
        <button type="button" onClick={onClose} className="btn-primary mt-7 w-full">
          Começar
        </button>
      </motion.div>
    </div>
  );
}
