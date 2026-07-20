"use client";

import { useEffect, useRef, useState } from "react";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import {
  drawEthicsWatermark,
  drawIllustrativeVolume,
} from "@/lib/ethicalRender";

type Props = {
  imageUrl: string;
  marks: Mark[];
};

/** Slider de intensidade — volumes ilustrativos, não morph de pele. */
export function MorphCompare({ imageUrl, marks }: Props) {
  const [scenario, setScenario] = useState<ScenarioId>("moderado");
  const [mix, setMix] = useState(55);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const w = 520;
      const h = (img.height / img.width) * w;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const mult =
        (SCENARIOS.find((s) => s.id === scenario)?.multiplier ?? 1) *
        (mix / 100);
      const warn = scenario === "nao_indicado";

      marks.forEach((mark) => {
        drawIllustrativeVolume(
          ctx,
          mark.x * w,
          mark.y * h,
          mark.intensity,
          mult,
          { warn },
        );
      });

      const label = SCENARIOS.find((s) => s.id === scenario)?.label;
      drawEthicsWatermark(ctx, label);
    };
    img.src = imageUrl;
  }, [imageUrl, marks, scenario, mix]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full overflow-hidden rounded-2xl border border-ink/10"
      />
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenario(s.id)}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              scenario === s.id
                ? "bg-sea-deep text-paper"
                : "border border-ink/10 text-ink-soft"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label className="block text-xs text-ink-soft">
        Intensidade da demonstração: {mix}%
        <input
          type="range"
          min={0}
          max={100}
          value={mix}
          onChange={(e) => setMix(Number(e.target.value))}
          className="mt-2 w-full accent-sea"
        />
      </label>
    </div>
  );
}
