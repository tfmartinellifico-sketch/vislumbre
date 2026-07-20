"use client";

import {
  PREFERENCE_OPTIONS,
  type PatientPreference,
} from "@/lib/alignment";

type Props = {
  value: PatientPreference | null;
  onChange: (v: PatientPreference) => void;
  compact?: boolean;
};

/** Preferência verbalizada pela paciente — diferencial de alinhamento. */
export function PreferenceCapture({ value, onChange, compact }: Props) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && (
        <>
          <p className="text-[12px] font-medium text-ink">
            Preferência da paciente
          </p>
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Depois de ver os cenários, registre o que ela verbalizou. Não é
            contrato — é memória da conversa.
          </p>
        </>
      )}
      <div className={`grid gap-2 ${compact ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {PREFERENCE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-xl border px-3.5 py-3 text-left transition ${
              value === opt.id
                ? "border-sea bg-sea/10"
                : "border-ink/10 hover:border-sea/30"
            }`}
          >
            <span className="block text-[13px] font-medium text-ink">
              {opt.label}
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-soft">
              {opt.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
