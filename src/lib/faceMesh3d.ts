import type { LandmarkPoint } from "./faceLandmarks";
import {
  regionNormalizedPosition,
  sideFromTemplateX,
} from "./faceLandmarks";
import type { Mark } from "./regions";

/**
 * Posição no plano da foto (Three.js): centro = 0,0; Y sobe.
 * z usa profundidade do landmark mais próximo (leve relevo).
 */
export function markOnPhotoPlane(
  mark: Mark,
  face: LandmarkPoint[],
  planeW: number,
  planeH: number,
): { x: number; y: number; z: number } | null {
  const side = sideFromTemplateX(mark.region, mark.x);
  const uv = regionNormalizedPosition(face, mark.region, side);
  if (!uv) return null;

  let nearestZ = 0;
  let bestD = Infinity;
  for (const p of face) {
    if (!p) continue;
    const d = (p.x - uv.x) ** 2 + (p.y - uv.y) ** 2;
    if (d < bestD) {
      bestD = d;
      nearestZ = p.z ?? 0;
    }
  }

  const depth = Math.min(0.14, Math.max(0.04, -nearestZ * 0.5 + 0.06));

  return {
    x: (uv.x - 0.5) * planeW,
    y: (0.5 - uv.y) * planeH,
    z: depth,
  };
}

/** Empurra Z dos vértices do plano com profundidade MediaPipe. */
export function applyLandmarkRelief(
  positionArray: Float32Array,
  vertexCount: number,
  face: LandmarkPoint[],
  planeW: number,
  planeH: number,
  strength = 0.5,
) {
  for (let i = 0; i < vertexCount; i++) {
    const x = positionArray[i * 3];
    const y = positionArray[i * 3 + 1];
    const u = x / planeW + 0.5;
    const v = 0.5 - y / planeH;

    let nearestZ = 0;
    let bestD = Infinity;
    for (const p of face) {
      if (!p) continue;
      const d = (p.x - u) ** 2 + (p.y - v) ** 2;
      if (d < bestD) {
        bestD = d;
        nearestZ = p.z ?? 0;
      }
    }
    positionArray[i * 3 + 2] = -nearestZ * strength;
  }
}
