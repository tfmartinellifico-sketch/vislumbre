"use client";

import { APP_COPY } from "@/lib/app-copy";

/** Orientação do módulo ao vivo — uso profissional na consulta. */
export function ArExplainer() {
  const c = APP_COPY.arExplainer;
  return (
    <div className="space-y-4 rounded-xl border border-sea/20 bg-sea/[0.04] p-4">
      <p className="text-[12px] font-medium text-ink">{c.title}</p>
      <ol className="space-y-3 text-[12px] leading-relaxed text-ink-soft">
        {c.steps.map((step, i) => (
          <li key={i}>
            <strong className="text-ink">{i + 1}.</strong> {step}
          </li>
        ))}
      </ol>
      <p className="text-[11px] leading-relaxed text-warn">{c.warn}</p>
    </div>
  );
}
