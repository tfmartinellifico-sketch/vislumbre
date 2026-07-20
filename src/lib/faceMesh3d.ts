import type { LandmarkPoint } from "./faceLandmarks";
import {
  regionNormalizedPosition,
  sideFromTemplateX,
} from "./faceLandmarks";
import type { Mark } from "./regions";

export type MeshConnection = { start: number; end: number };

/** Converte landmark MediaPipe (0–1, y↓) para espaço Three.js centrado. */
export function landmarksToCentered(face: LandmarkPoint[]): {
  positions: Float32Array;
  uvs: Float32Array;
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
  const scale = 1.55 / iod;

  const positions = new Float32Array(face.length * 3);
  const uvs = new Float32Array(face.length * 2);
  for (let i = 0; i < face.length; i++) {
    const p = face[i];
    if (!p) continue;
    positions[i * 3] = (p.x - cx) * scale;
    positions[i * 3 + 1] = -(p.y - cy) * scale;
    positions[i * 3 + 2] = -((p.z ?? 0) - cz) * scale * 1.15;
    uvs[i * 2] = p.x;
    uvs[i * 2 + 1] = 1 - p.y;
  }

  return { positions, uvs, scale };
}

/**
 * A tessellation do MediaPipe é lista de arestas.
 * Recupera triângulos = ciclos de 3 no grafo.
 */
export function trianglesFromConnections(
  connections: MeshConnection[],
  vertexCount: number,
): Uint32Array {
  const adj: Set<number>[] = Array.from(
    { length: vertexCount },
    () => new Set(),
  );
  for (const { start, end } of connections) {
    if (start >= vertexCount || end >= vertexCount) continue;
    adj[start].add(end);
    adj[end].add(start);
  }

  const seen = new Set<string>();
  const tris: number[] = [];
  for (let a = 0; a < vertexCount; a++) {
    const neigh = [...adj[a]];
    for (let i = 0; i < neigh.length; i++) {
      for (let j = i + 1; j < neigh.length; j++) {
        const b = neigh[i];
        const c = neigh[j];
        if (!adj[b].has(c)) continue;
        const key = [a, b, c].sort((x, y) => x - y).join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        // Orientação aproximada (anti-horário em XY)
        tris.push(a, b, c);
      }
    }
  }
  return new Uint32Array(tris);
}

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
    positions[best * 3 + 2] + 0.05,
  ];
}
