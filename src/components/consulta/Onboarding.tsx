"use client";

import { motion } from "framer-motion";
import { APP_COPY } from "@/lib/app-copy";

type Props = {
  onClose: () => void;
};

export function Onboarding({ onClose }: Props) {
  const c = APP_COPY.onboarding;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-[2px] sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel w-full max-w-lg p-7 md:p-8"
      >
        <p className="text-[11px] uppercase tracking-[0.22em] text-sea">
          {c.eyebrow}
        </p>
        <h2 className="display mt-2 text-3xl tracking-tight text-ink">
          {c.title}
        </h2>
        <ol className="mt-6 space-y-4 text-[14px] leading-[1.65] text-ink-soft">
          {c.steps.map((step) => (
            <li key={step.t}>
              <strong className="text-ink">{step.t}</strong> — {step.d}
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg border border-warn/25 bg-warn/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-warn">
          {c.warn}
        </p>
        <button type="button" onClick={onClose} className="btn-primary mt-7 w-full">
          {c.cta}
        </button>
      </motion.div>
    </div>
  );
}
