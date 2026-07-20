"use client";

import { useEffect, useRef } from "react";
import type { Mark, RegionId, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import {
  drawEthicsWatermark,
  drawIllustrativeVolume,
} from "@/lib/ethicalRender";
import type { Measure, Vector } from "@/lib/planning";
import { cautionZonesOnFace } from "@/lib/cautionZones";
import type { LandmarkPoint } from "@/lib/faceLandmarks";

export type DrawMode = "mark" | "vector" | "measure";

type Props = {
  imageUrl: string | null;
  marks: Mark[];
  vectors?: Vector[];
  measures?: Measure[];
  activeRegion: RegionId;
  intensity: number;
  scenario: ScenarioId;
  drawMode?: DrawMode;
  onAddMark: (mark: Omit<Mark, "id">) => void;
  onAddVector?: (vector: Omit<Vector, "id" | "label">) => void;
  onAddMeasure?: (measure: Omit<Measure, "id">) => void;
  interactive?: boolean;
  showCautionZones?: boolean;
  /** Landmarks da foto — obrigatório para zonas de atenção no rosto. */
  faceLandmarks?: LandmarkPoint[] | null;
};

const REGION_COLOR: Record<RegionId, string> = {
  malar: "47, 95, 88",
  olheira: "90, 130, 150",
  sulco: "120, 100, 80",
  labios: "154, 90, 90",
  mandibula: "60, 90, 85",
  mento: "80, 110, 100",
  temple: "100, 120, 110",
};

export function FaceCanvas({
  imageUrl,
  marks,
  vectors = [],
  measures = [],
  activeRegion,
  intensity,
  scenario,
  drawMode = "mark",
  onAddMark,
  onAddVector,
  onAddMeasure,
  interactive = true,
  showCautionZones = false,
  faceLandmarks = null,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const draftRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = canvas.parentElement?.clientWidth ?? 640;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      draw();
    };
    img.src = imageUrl;

    function draw() {
      if (!ctx || !canvas || !imgRef.current) return;
      const scenarioMeta = SCENARIOS.find((s) => s.id === scenario);
      const mult = scenarioMeta?.multiplier ?? 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      if (scenario === "nao_indicado") {
        ctx.fillStyle = "rgba(154, 77, 46, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (showCautionZones && faceLandmarks?.length) {
        cautionZonesOnFace(faceLandmarks, canvas.width, canvas.height).forEach(
          (zone) => {
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(154, 77, 46, 0.7)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(154, 77, 46, 0.1)";
            ctx.fill();
            ctx.fillStyle = "rgba(154, 77, 46, 0.95)";
            ctx.font = "600 11px sans-serif";
            ctx.fillText(zone.label, zone.x - zone.r * 0.35, zone.y - zone.r - 4);
          },
        );
      }

      const faceWEstimate = (() => {
        if (marks.length >= 2) {
          const xs = marks.map((m) => m.x);
          const span = (Math.max(...xs) - Math.min(...xs)) * canvas.width;
          return Math.max(canvas.width * 0.28, span * 2.4);
        }
        return canvas.width * 0.38;
      })();

      marks.forEach((mark) => {
        const x = mark.x * canvas.width;
        const y = mark.y * canvas.height;
        drawIllustrativeVolume(ctx, x, y, mark.intensity, mult, {
          rgb: REGION_COLOR[mark.region],
          warn: scenario === "nao_indicado",
          faceWidthPx: faceWEstimate,
        });
      });

      vectors.forEach((v) => {
        const x1 = v.x1 * canvas.width;
        const y1 = v.y1 * canvas.height;
        const x2 = v.x2 * canvas.width;
        const y2 = v.y2 * canvas.height;
        drawArrow(ctx, x1, y1, x2, y2, "#1c3d39");
      });

      measures.forEach((m) => {
        const x1 = m.x1 * canvas.width;
        const y1 = m.y1 * canvas.height;
        const x2 = m.x2 * canvas.width;
        const y2 = m.y2 * canvas.height;
        ctx.strokeStyle = "rgba(154, 77, 46, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const rel = (dist / canvas.width) * 100;
        ctx.fillStyle = "rgba(18, 26, 25, 0.8)";
        ctx.font = "11px sans-serif";
        ctx.fillText(`${rel.toFixed(1)}% largura`, (x1 + x2) / 2 + 6, (y1 + y2) / 2);
      });

      if (marks.length > 0 || scenario !== "conservador") {
        drawEthicsWatermark(ctx, scenarioMeta?.label);
      }
    }

    draw();
  }, [
    imageUrl,
    marks,
    vectors,
    measures,
    scenario,
    showCautionZones,
    faceLandmarks,
  ]);

  function norm(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactive || !imageUrl) return;
    const p = norm(e);
    if (!p) return;
    if (drawMode === "mark") {
      onAddMark({ region: activeRegion, x: p.x, y: p.y, intensity });
      return;
    }
    draftRef.current = p;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactive || !imageUrl || !draftRef.current) return;
    const p = norm(e);
    if (!p) return;
    const start = draftRef.current;
    draftRef.current = null;
    if (Math.hypot(p.x - start.x, p.y - start.y) < 0.02) return;
    if (drawMode === "vector") {
      onAddVector?.({ x1: start.x, y1: start.y, x2: p.x, y2: p.y });
    }
    if (drawMode === "measure") {
      onAddMeasure?.({ x1: start.x, y1: start.y, x2: p.x, y2: p.y });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-fog shadow-[0_24px_60px_-48px_rgba(14,22,21,0.45)]">
      {!imageUrl ? (
        <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="display text-2xl tracking-tight text-ink">
            Foto da consulta
          </p>
          <p className="max-w-xs text-[13px] leading-relaxed text-ink-soft">
            Envie a frontal ao lado ou use a face demonstrativa para percorrer o
            fluxo completo.
          </p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className={`block w-full ${interactive ? "cursor-crosshair touch-none" : ""}`}
        />
      )}
    </div>
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const head = 10;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}
