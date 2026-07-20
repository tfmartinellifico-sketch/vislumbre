import { SCENARIOS, type Mark, type ScenarioId } from "./regions";
import {
  drawEthicsWatermark,
  drawIllustrativeVolume,
} from "./ethicalRender";

/** Desenha foto + volumes ilustrativos (não morph) e devolve data URL (JPEG). */
export function renderScenarioDataUrl(
  imageUrl: string,
  marks: Mark[],
  scenario: ScenarioId,
  width = 480,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const h = Math.round((img.height / img.width) * width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas indisponível"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, h);

      const mult = SCENARIOS.find((s) => s.id === scenario)?.multiplier ?? 1;
      const warn = scenario === "nao_indicado";
      if (warn) {
        ctx.fillStyle = "rgba(154, 77, 46, 0.08)";
        ctx.fillRect(0, 0, width, h);
      }

      marks.forEach((mark) => {
        drawIllustrativeVolume(
          ctx,
          mark.x * width,
          mark.y * h,
          mark.intensity,
          mult,
          { warn },
        );
      });

      const label = SCENARIOS.find((s) => s.id === scenario)?.label ?? scenario;
      drawEthicsWatermark(ctx, label);

      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => reject(new Error("Falha ao carregar foto"));
    img.src = imageUrl;
  });
}

export async function renderAllScenarios(
  imageUrl: string,
  marks: Mark[],
  width = 420,
): Promise<Record<ScenarioId, string>> {
  const ids = SCENARIOS.map((s) => s.id);
  const entries = await Promise.all(
    ids.map(
      async (id) =>
        [id, await renderScenarioDataUrl(imageUrl, marks, id, width)] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<ScenarioId, string>;
}
