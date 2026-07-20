import type { LandmarkPoint } from "./faceLandmarks";
import {
  regionNormalizedPosition,
  sideFromTemplateX,
} from "./faceLandmarks";
import type { Mark } from "./regions";

/** Converte landmark MediaPipe (0–1, y↓) para espaço Three.js centrado. */
export function landmarksToCentered(face: LandmarkPoint[]): {
  positions: Float32Array;
  scale: number;
} {
  const tip = face[1] ?? face[4];
  const left = face[33];
  const right = face[263];
  const cx = tip?.x ?? 0.5;
  const cy = tip?.y ?? 0.5;
  const cz = tip?.z ?? 0;
  const iod =
    left && right
      ? Math.hypot(left.x - right.x, left.y - right.y) || 0.2
      : 0.2;
  const scale = 1.6 / iod;

  const positions = new Float32Array(face.length * 3);
  for (let i = 0; i < face.length; i++) {
    const p = face[i];
    if (!p) continue;
    positions[i * 3] = (p.x - cx) * scale;
    positions[i * 3 + 1] = -(p.y - cy) * scale;
    positions[i * 3 + 2] = -((p.z ?? 0) - cz) * scale * 0.85;
  }

  return { positions, scale };
}

/** Posição 3D de uma marca: landmark anatômico mais próximo da âncora 2D. */
export function markToVec3(
  mark: Mark,
  face: LandmarkPoint[],
  positions: Float32Array,
): [number, number, number] | null {
  const side = sideFromTemplateX(mark.region, mark.x);
  const uv = regionNormalizedPosition(face, mark.region, side);
  const tx = uv?.x ?? mark.x;
  const ty = uv?.y ?? mark.y;

  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < face.length; i++) {
    const p = face[i];
    if (!p) continue;
    const d = (p.x - tx) ** 2 + (p.y - ty) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  if (best < 0) return null;
  return [
    positions[best * 3],
    positions[best * 3 + 1],
    positions[best * 3 + 2] + 0.045,
  ];
}
