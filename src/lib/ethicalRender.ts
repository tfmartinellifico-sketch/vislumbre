import type { ScenarioId } from "./regions";

/** Limites visuais — impede aparência de “simulador de resultado”. */
export const ILLUSTRATION = {
  maxVolumeOpacity: 0.38,
  maxRadiusFactor: 0.14,
  watermark: "Demonstração · não é resultado",
  watermarkSub: "Vislumbre — conversa, não previsão",
} as const;

type VolumeOpts = {
  rgb?: string;
  intensity?: number;
  multiplier?: number;
  warn?: boolean;
};

/** Volume ilustrativo: halo suave + anel tracejado (não morph de pele). */
export function drawIllustrativeVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number,
  multiplier = 1,
  opts: VolumeOpts = {},
) {
  const warn = opts.warn ?? false;
  const rgb = warn ? "154, 77, 46" : (opts.rgb ?? "47, 95, 88");
  const cap = ILLUSTRATION.maxVolumeOpacity;
  const r = Math.min(
    12 + intensity * multiplier * 32,
    ctx.canvas.width * ILLUSTRATION.maxRadiusFactor,
  );

  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${Math.min(cap, 0.22 + intensity * 0.18)})`);
  g.addColorStop(0.55, `rgba(${rgb}, ${Math.min(cap * 0.5, 0.08)})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(${rgb}, ${warn ? 0.75 : 0.65})`;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = `rgba(${rgb}, 0.9)`;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEthicsWatermark(
  ctx: CanvasRenderingContext2D,
  scenarioLabel?: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const barH = Math.max(28, h * 0.06);

  ctx.fillStyle = "rgba(14, 22, 21, 0.72)";
  ctx.fillRect(0, h - barH, w, barH);

  ctx.fillStyle = "#fafcfb";
  ctx.font = `600 ${Math.max(10, w * 0.028)}px sans-serif`;
  const line1 = scenarioLabel
    ? `${scenarioLabel} · ${ILLUSTRATION.watermark}`
    : ILLUSTRATION.watermark;
  ctx.fillText(line1, 12, h - barH / 2 + 4);

  ctx.globalAlpha = 0.07;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.42);
  ctx.rotate(-0.35);
  ctx.font = `700 ${Math.max(14, w * 0.055)}px sans-serif`;
  ctx.fillStyle = "#143833";
  ctx.textAlign = "center";
  ctx.fillText("NÃO É SIMULAÇÃO DE RESULTADO", 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function scenarioWarn(scenario: ScenarioId) {
  return scenario === "nao_indicado";
}

export const VS_SIMULATORS = {
  title: "Feito para a conversa — não para parecer o resultado",
  points: [
    {
      vislumbre: "Volumes suaves e tracejados — linguagem de conversa",
      simulator: "Morphing fotorealista da pele — aparência de “after”",
    },
    {
      vislumbre: "Três cenários incluindo o exagero a evitar",
      simulator: "Foco em “preview” do resultado final",
    },
    {
      vislumbre: "Avisos em tela, câmera ao vivo e PDF",
      simulator: "Imagens fáceis de confundir com before-and-after",
    },
    {
      vislumbre: "Sem produto, dose ou simulação de procedimento",
      simulator: "Simulação de preenchimento ou intervenção",
    },
  ],
} as const;
