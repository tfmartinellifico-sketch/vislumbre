"use client";

import {
  alignmentBand,
  alignmentScore,
  type PatientPreference,
} from "@/lib/alignment";
import { TOPIC_CHECKS } from "@/lib/planning";

type Props = {
  topics: string[];
  hasMarks: boolean;
  showedExaggerated: boolean;
  patientAck: boolean;
  preference: PatientPreference | null;
  accepted: boolean;
};

export function AlignmentMeter(props: Props) {
  const score = alignmentScore({
    ...props,
    topicTotal: TOPIC_CHECKS.length,
  });
  const band = alignmentBand(score);

  return (
    <div className="rounded-xl border border-ink/10 bg-paper px-3.5 py-3.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-sea">
            Índice de alinhamento
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">{band.label}</p>
        </div>
        <p className="display text-3xl leading-none text-ink">{score}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            band.tone === "sea"
              ? "bg-sea"
              : band.tone === "sand"
                ? "bg-sand-deep"
                : "bg-warn"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">
        Sobe com checklist, marcas, cenário exagerado mostrado, preferência da
        paciente e confirmações. Não é nota clínica — é lembrete da conversa.
      </p>
    </div>
  );
}
