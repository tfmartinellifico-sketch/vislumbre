import type { ScenarioId } from "./regions";

/** Limites visuais — anel compacto, legível, sem “bola” enorme. */
export const ILLUSTRATION = {
  maxVolumeOpacity: 0.42,
  maxRadiusFactor: 0.055,
  watermark: "Demonstração · não é resultado",
  watermarkSub: "Vislumbre — conversa, não previsão",
} as const;

type VolumeOpts = {
  rgb?: string;
  intensity?: number;
  multiplier?: number;
  warn?: boolean;
  /** Escala relativa à largura do rosto (px). */
  faceWidthPx?: number;
};

/** Volume ilustrativo: halo curto + anel tracejado (não morph de pele). */
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
  const faceCap = opts.faceWidthPx
    ? opts.faceWidthPx * 0.11
    : ctx.canvas.width * ILLUSTRATION.maxRadiusFactor;
  const r = Math.min(
    10 + intensity * multiplier * 22,
    faceCap,
    ctx.canvas.width * ILLUSTRATION.maxRadiusFactor,
  );

  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${Math.min(cap, 0.28 + intensity * 0.2)})`);
  g.addColorStop(0.5, `rgba(${rgb}, ${Math.min(cap * 0.55, 0.12)})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(${rgb}, ${warn ? 0.85 : 0.8})`;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Halo claro atrás do ponto — legível em barba / sombra
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(250, 252, 251, 0.9)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${rgb}, 0.95)`;
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
