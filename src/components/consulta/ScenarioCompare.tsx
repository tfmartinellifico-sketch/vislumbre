"use client";

import { useEffect, useRef } from "react";
import { SCENARIOS, type Mark, type ScenarioId } from "@/lib/regions";
import {
  drawIllustrativeVolume,
} from "@/lib/ethicalRender";

type Props = {
  imageUrl: string;
  marks: Mark[];
  active: ScenarioId;
  onSelect: (id: ScenarioId) => void;
};

export function ScenarioCompare({ imageUrl, marks, active, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={`overflow-hidden rounded-2xl border text-left transition ${
            active === s.id
              ? s.tone === "warn"
                ? "border-warn ring-1 ring-warn/40"
                : "border-sea ring-1 ring-sea/40"
              : "border-ink/10"
          }`}
        >
          <MiniFace imageUrl={imageUrl} marks={marks} scenario={s.id} />
          <div className="bg-paper px-3.5 py-3">
            <p className="text-[13px] font-medium text-ink">{s.label}</p>
            <p className="mt-1 text-[11px] leading-snug text-ink-soft">
              {s.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function MiniFace({
  imageUrl,
  marks,
  scenario,
}: {
  imageUrl: string;
  marks: Mark[];
  scenario: ScenarioId;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const w = 240;
      const h = (img.height / img.width) * w;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const mult = SCENARIOS.find((s) => s.id === scenario)?.multiplier ?? 1;
      if (scenario === "nao_indicado") {
        ctx.fillStyle = "rgba(154, 77, 46, 0.1)";
        ctx.fillRect(0, 0, w, h);
      }
      marks.forEach((mark) => {
        drawIllustrativeVolume(
          ctx,
          mark.x * w,
          mark.y * h,
          mark.intensity,
          mult,
          { warn: scenario === "nao_indicado" },
        );
      });
    };
    img.src = imageUrl;
  }, [imageUrl, marks, scenario]);

  return <canvas ref={ref} className="block w-full bg-fog" />;
}
