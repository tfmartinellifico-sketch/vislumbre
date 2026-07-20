"use client";

import { useEffect, useState } from "react";

type Props = {
  imageUrl: string | null;
};

type Hint = { ok: boolean; label: string };

/** Dicas rápidas de qualidade da foto — diferencial de captura. */
export function PhotoQualityHint({ imageUrl }: Props) {
  const [hints, setHints] = useState<Hint[] | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      const t = window.setTimeout(() => setHints(null), 0);
      return () => window.clearTimeout(t);
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const w = 64;
      const h = Math.round((img.height / img.width) * w);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let sum = 0;
      let dark = 0;
      let bright = 0;
      const n = w * h;
      for (let i = 0; i < data.length; i += 4) {
        const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += y;
        if (y < 40) dark++;
        if (y > 230) bright++;
      }
      const avg = sum / n;
      setHints([
        {
          ok: avg > 55 && avg < 200,
          label:
            avg <= 55
              ? "Pouca luz — tente iluminar de frente"
              : avg >= 200
                ? "Muita luz / estouro — suavize a iluminação"
                : "Luminosidade adequada",
        },
        {
          ok: dark / n < 0.35,
          label:
            dark / n >= 0.35
              ? "Sombras fortes — evite luz lateral extrema"
              : "Contraste utilizável",
        },
        {
          ok: bright / n < 0.2,
          label:
            bright / n >= 0.2
              ? "Áreas muito claras — ajuste o enquadramento"
              : "Sem estouro excessivo",
        },
        {
          ok: img.width >= 600,
          label:
            img.width < 600
              ? "Resolução baixa — prefira foto mais nítida"
              : "Resolução suficiente para a conversa",
        },
      ]);
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  if (!imageUrl || !hints || hints.length === 0) return null;

  const okCount = hints.filter((h) => h.ok).length;

  return (
    <div className="rounded-xl border border-ink/10 bg-fog/60 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-sea">
          Qualidade do registro
        </p>
        <span className="text-[11px] text-ink-soft">
          {okCount}/{hints.length} ok
        </span>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {hints.map((h) => (
          <li
            key={h.label}
            className={`text-[12px] ${h.ok ? "text-ink-soft" : "text-warn"}`}
          >
            <span className="mr-1.5">{h.ok ? "●" : "○"}</span>
            {h.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
