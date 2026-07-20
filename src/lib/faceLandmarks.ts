import type { RegionId } from "./regions";

export type LandmarkPoint = { x: number; y: number; z?: number };

/**
 * Âncoras clínicas (MediaPipe Face Mesh).
 * left/right = lado da imagem (foto sem espelho).
 * @see https://www.sanderdesnaijer.com/blog/mediapipe-face-mesh-landmarks
 */
export const REGION_ANCHORS: Record<
  RegionId,
  { left?: number[]; right?: number[]; center?: number[] }
> = {
  // Maçã / zigoma anterior (não borda da orelha)
  malar: { left: [50, 123, 187], right: [280, 352, 411] },
  // Pálpebra inferior — depois puxamos para o sulco lacrimal
  olheira: { left: [145, 153, 154], right: [374, 380, 381] },
  // Nasogeniano
  sulco: { left: [92, 206, 216], right: [322, 426, 436] },
  labios: { center: [13, 14, 17] },
  mento: { center: [152, 175, 199] },
  // Ângulo mandibular um pouco acima da borda (visível no barba)
  mandibula: { left: [58, 172, 215], right: [288, 397, 435] },
  temple: { left: [54, 21, 162], right: [284, 251, 389] },
};

export type FaceSide = "left" | "right" | "center";

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

function mix(
  a: LandmarkPoint,
  b: LandmarkPoint,
  t: number,
): LandmarkPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/** Ajuste fino por região (posição clínica, não só o índice bruto). */
function refineRegionPoint(
  face: LandmarkPoint[],
  region: RegionId,
  side: FaceSide,
  point: LandmarkPoint,
): LandmarkPoint {
  if (region === "olheira") {
    const cheek = averageLandmarks(
      face,
      side === "right" ? [345, 352] : [116, 123],
    );
    if (cheek) {
      // Sulco lacrimal: entre pálpebra e maçã, um pouco abaixo do olho
      return {
        x: point.x * 0.55 + cheek.x * 0.45,
        y: point.y * 0.35 + cheek.y * 0.65,
      };
    }
  }

  if (region === "malar") {
    const nose = face[4] ?? face[1];
    if (nose) {
      // Um pouco mais medial (projeção malar típica na conversa)
      return mix(point, nose, 0.22);
    }
  }

  if (region === "sulco") {
    const mouth = face[61] && face[291]
      ? {
          x: (face[61].x + face[291].x) / 2,
          y: (face[61].y + face[291].y) / 2,
        }
      : face[13];
    if (mouth) return mix(point, mouth, 0.12);
  }

  if (region === "mandibula") {
    const chin = face[152];
    if (chin) {
      // Sobe um pouco da borda + puxa ao mento (visível no barba)
      return {
        x: point.x * 0.82 + chin.x * 0.18,
        y: point.y * 0.88 + chin.y * 0.12 - 0.012,
      };
    }
  }

  return point;
}

/** Posição normalizada (0–1) na foto — FaceCanvas / roteiros. */
export function regionNormalizedPosition(
  face: LandmarkPoint[],
  region: RegionId,
  side: FaceSide,
): { x: number; y: number } | null {
  const anchors = REGION_ANCHORS[region];
  let point: LandmarkPoint | null = null;

  if (side === "center") {
    if (!anchors.center?.length) return null;
    point = averageLandmarks(face, anchors.center);
  } else if (side === "left" && anchors.left?.length) {
    point = averageLandmarks(face, anchors.left);
  } else if (side === "right" && anchors.right?.length) {
    point = averageLandmarks(face, anchors.right);
  } else if (anchors.center?.length) {
    point = averageLandmarks(face, anchors.center);
  }

  if (!point) return null;
  point = refineRegionPoint(face, region, side, point);
  return { x: point.x, y: point.y };
}

export function sideFromTemplateX(region: RegionId, x: number): FaceSide {
  const anchors = REGION_ANCHORS[region];
  if (anchors.center?.length && !anchors.left) return "center";
  if (x < 0.5) return "left";
  return "right";
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

export function markToScreenPosition(
  mark: { region: RegionId; x: number; y: number },
  face: LandmarkPoint[],
  canvasW: number,
  canvasH: number,
  mirrored = true,
): { x: number; y: number } | null {
  const side = sideFromTemplateX(mark.region, mark.x);
  const norm = regionNormalizedPosition(face, mark.region, side);
  if (!norm) return null;
  return toScreen(norm, canvasW, canvasH, mirrored);
}

export function faceWidthPx(face: LandmarkPoint[], canvasW: number): number {
  const a = face[33];
  const b = face[263];
  if (!a || !b) return canvasW * 0.35;
  return Math.abs(a.x - b.x) * canvasW;
}

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
