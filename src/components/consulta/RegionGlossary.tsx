"use client";

import { REGION_GLOSSARY } from "@/lib/alignment";

type Props = {
  activeRegion?: string;
};

export function RegionGlossary({ activeRegion }: Props) {
  const focus =
    REGION_GLOSSARY.find((r) => r.id === activeRegion) ?? REGION_GLOSSARY[0];

  return (
    <div className="rounded-xl border border-ink/10 bg-fog/70 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-sea">
        Para explicar à paciente
      </p>
      <h3 className="mt-2 text-[14px] font-medium text-ink">{focus.title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
        {focus.patient}
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] text-sea-deep hover:underline">
          Ver outras regiões
        </summary>
        <ul className="mt-3 max-h-40 space-y-2.5 overflow-y-auto">
          {REGION_GLOSSARY.filter((r) => r.id !== focus.id).map((r) => (
            <li key={r.id} className="text-[11px] leading-relaxed text-ink-soft">
              <strong className="text-ink">{r.title}.</strong> {r.patient}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
