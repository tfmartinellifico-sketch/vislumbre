"use client";

import { FaceCanvas } from "./FaceCanvas";
import type { Mark, ScenarioId } from "@/lib/regions";

type Props = {
  frontUrl: string | null;
  profileUrl: string | null;
  marks: Mark[];
  scenario: ScenarioId;
};

export function DualAngleView({
  frontUrl,
  profileUrl,
  marks,
  scenario,
}: Props) {
  if (!frontUrl && !profileUrl) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 text-center text-[14px] leading-relaxed text-ink-soft">
        Inclua a foto frontal — e o perfil, se quiser explicar projeção.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-sea">
          Frontal
        </p>
        <FaceCanvas
          imageUrl={frontUrl}
          marks={marks}
          activeRegion="malar"
          intensity={0.5}
          scenario={scenario}
          onAddMark={() => undefined}
          interactive={false}
        />
      </div>
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-sea">
          Perfil
        </p>
        {profileUrl ? (
          <FaceCanvas
            imageUrl={profileUrl}
            marks={marks.filter((m) =>
              ["malar", "mento", "mandibula", "labios", "sulco"].includes(
                m.region,
              ),
            )}
            activeRegion="mento"
            intensity={0.5}
            scenario={scenario}
            onAddMark={() => undefined}
            interactive={false}
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-ink/15 bg-fog text-xs text-ink-soft">
            Sem foto de perfil — adicione na etapa Foto
          </div>
        )}
      </div>
    </div>
  );
}
