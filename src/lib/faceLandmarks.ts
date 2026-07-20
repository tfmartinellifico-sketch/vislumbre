import type { RegionId } from "./regions";

export type LandmarkPoint = { x: number; y: number; z?: number };

/**
 * Âncoras no meio da região (superfície), não no contorno perto da orelha.
 * left/right = lado da imagem da câmera (sem espelho).
 * @see https://www.sanderdesnaijer.com/blog/mediapipe-face-mesh-landmarks
 */
export const REGION_ANCHORS: Record<
  RegionId,
  { left?: number[]; right?: number[]; center?: number[] }
> = {
  // Maçã do rosto / zigoma medial — evita 234/454 (borda perto da orelha)
  malar: { left: [116, 123, 50], right: [345, 352, 280] },
  olheira: { left: [111, 31, 228], right: [340, 261, 448] },
  sulco: { left: [205, 187, 92], right: [425, 411, 322] },
  labios: { center: [13, 14, 0] },
  mento: { center: [152, 377, 148] },
  mandibula: { left: [172, 136, 150], right: [397, 365, 379] },
  temple: { left: [21, 54, 103], right: [251, 284, 332] },
};

function averageLandmarks(
  face: LandmarkPoint[],
  indices: number[],
): LandmarkPoint | null {
  let x = 0;
  let y = 0;
  let n = 0;
  for (const i of indices) {
    const p = face[i];
    if (!p) continue;
    x += p.x;
    y += p.y;
    n += 1;
  }
  if (!n) return null;
  return { x: x / n, y: y / n };
}

function toScreen(
  p: LandmarkPoint,
  canvasW: number,
  canvasH: number,
  mirrored: boolean,
) {
  return {
    x: mirrored ? (1 - p.x) * canvasW : p.x * canvasW,
    y: p.y * canvasH,
  };
}

/**
 * Posição na tela só pela anatomia da região.
 * mark.x só escolhe o lado (bilateral); não remapeia pela bbox da foto.
 */
export function markToScreenPosition(
  mark: { region: RegionId; x: number; y: number },
  face: LandmarkPoint[],
  canvasW: number,
  canvasH: number,
  mirrored = true,
): { x: number; y: number } | null {
  const anchors = REGION_ANCHORS[mark.region];
  let point: LandmarkPoint | null = null;

  if (anchors.center?.length) {
    point = averageLandmarks(face, anchors.center);
  } else if (anchors.left?.length && anchors.right?.length) {
    // x < 0.5 = lado esquerdo da foto/marca
    const indices = mark.x < 0.5 ? anchors.left : anchors.right;
    point = averageLandmarks(face, indices);
  }

  if (!point) return null;
  return toScreen(point, canvasW, canvasH, mirrored);
}

/** Largura aproximada do rosto (olhos externos) — escala dos volumes. */
export function faceWidthPx(
  face: LandmarkPoint[],
  canvasW: number,
): number {
  const a = face[33];
  const b = face[263];
  if (!a || !b) return canvasW * 0.35;
  return Math.abs(a.x - b.x) * canvasW;
}

/** Suavização exponencial para reduzir tremor do overlay. */
export function smoothPoint(
  prev: { x: number; y: number } | null,
  next: { x: number; y: number },
  alpha = 0.55,
) {
  if (!prev) return next;
  return {
    x: prev.x * (1 - alpha) + next.x * alpha,
    y: prev.y * (1 - alpha) + next.y * alpha,
  };
}
