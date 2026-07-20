"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import { drawIllustrativeVolume } from "@/lib/ethicalRender";

type Props = {
  marks: Mark[];
  scenario: ScenarioId;
};

export function ArPreview({ marks, scenario }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [meshOn, setMeshOn] = useState(true);
  const [guideOn, setGuideOn] = useState(true);
  const [faceOk, setFaceOk] = useState(false);
  const [status, setStatus] = useState("Preparando visualização…");
  const marksRef = useRef(marks);
  const scenarioRef = useRef(scenario);
  const meshOnRef = useRef(meshOn);
  const guideOnRef = useRef(guideOn);
  const faceOkRef = useRef(false);

  useEffect(() => {
    marksRef.current = marks;
    scenarioRef.current = scenario;
    meshOnRef.current = meshOn;
    guideOnRef.current = guideOn;
  }, [marks, scenario, meshOn, guideOn]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let landmarker: FaceLandmarker | null = null;
    let lastVideoTime = -1;
    let missFrames = 0;

    async function start() {
      try {
        setStatus("Carregando rastreamento facial…");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm",
        );
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
        setStatus("Posicione o rosto na moldura");
        loop();
      } catch {
        setError(
          "Não foi possível abrir a câmera. Permita o acesso e use Chrome ou Edge em conexão segura.",
        );
      }
    }

    function drawGuide(
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      locked: boolean,
    ) {
      if (!guideOnRef.current) return;
      const cx = w * 0.5;
      const cy = h * 0.46;
      const rx = w * 0.22;
      const ry = h * 0.34;

      ctx.save();
      ctx.fillStyle = "rgba(14, 22, 21, 0.35)";
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, true);
      ctx.fill("evenodd");

      ctx.strokeStyle = locked
        ? "rgba(107, 154, 144, 0.9)"
        : "rgba(250, 252, 251, 0.75)";
      ctx.lineWidth = locked ? 2.5 : 1.5;
      ctx.setLineDash(locked ? [] : [8, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cantos
      const arm = Math.min(w, h) * 0.04;
      ctx.strokeStyle = "rgba(203, 184, 154, 0.7)";
      ctx.lineWidth = 2;
      [
        [24, 24, 1, 1],
        [w - 24, 24, -1, 1],
        [24, h - 24, 1, -1],
        [w - 24, h - 24, -1, -1],
      ].forEach(([x, y, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + sy * arm);
        ctx.lineTo(x, y);
        ctx.lineTo(x + sx * arm, y);
        ctx.stroke();
      });
      ctx.restore();
    }

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !landmarker) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        let locked = faceOkRef.current;

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const result = landmarker.detectForVideo(video, performance.now());
          const face = result.faceLandmarks?.[0];

          if (face?.length) {
            missFrames = 0;
            locked = true;
            if (!faceOkRef.current) {
              faceOkRef.current = true;
              setFaceOk(true);
              setStatus("Rosto alinhado · volumes sobrepostos");
            }

            const xs = face.map((p) => (1 - p.x) * w);
            const ys = face.map((p) => p.y * h);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const faceW = Math.max(1, maxX - minX);
            const faceH = Math.max(1, maxY - minY);

            if (meshOnRef.current) {
              ctx.fillStyle = "rgba(107, 154, 144, 0.4)";
              for (let i = 0; i < face.length; i += 4) {
                const x = (1 - face[i].x) * w;
                const y = face[i].y * h;
                ctx.beginPath();
                ctx.arc(x, y, 1.1, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.strokeStyle = "rgba(107, 154, 144, 0.5)";
              ctx.lineWidth = 1.25;
              ctx.strokeRect(minX, minY, faceW, faceH);
            }

            const mult =
              SCENARIOS.find((s) => s.id === scenarioRef.current)?.multiplier ??
              1;
            const warn = scenarioRef.current === "nao_indicado";

            marksRef.current.forEach((mark) => {
              const x = minX + mark.x * faceW;
              const y = minY + mark.y * faceH;
              drawIllustrativeVolume(ctx, x, y, mark.intensity, mult, {
                warn,
              });
            });
          } else {
            missFrames += 1;
            if (missFrames > 12 && faceOkRef.current) {
              faceOkRef.current = false;
              setFaceOk(false);
              setStatus("Posicione o rosto na moldura");
            }
            locked = false;
          }
        }

        drawGuide(ctx, w, h, locked);

        const label =
          SCENARIOS.find((s) => s.id === scenarioRef.current)?.label ??
          "Cenário";
        const barH = 44;
        ctx.fillStyle = "rgba(14, 22, 21, 0.68)";
        ctx.fillRect(12, h - barH - 12, w - 24, barH);
        ctx.fillStyle = "#fafcfb";
        ctx.font = "600 13px sans-serif";
        ctx.fillText(`${label}`, 24, h - 34);
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "rgba(231, 239, 236, 0.9)";
        ctx.fillText(
          "Demonstração para conversa · não é o resultado",
          24,
          h - 18,
        );
      }

      raf = requestAnimationFrame(loop);
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, []);

  if (error) {
    return (
      <div className="panel border-warn/30 bg-warn/[0.04] px-5 py-8 text-[14px] leading-relaxed text-warn">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-[0_24px_60px_-48px_rgba(14,22,21,0.55)]">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="block w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-[14px] text-mist">
            {status}
          </div>
        )}
        {ready && (
          <div
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] ${
              faceOk
                ? "bg-sea/90 text-paper"
                : "bg-ink/70 text-mist"
            }`}
          >
            {faceOk ? "Rosto ok" : "Aguardando rosto"}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-soft">
        <span>{ready ? status : "Abrindo câmera…"}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={guideOn}
              onChange={(e) => setGuideOn(e.target.checked)}
              className="accent-sea"
            />
            Moldura
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={meshOn}
              onChange={(e) => setMeshOn(e.target.checked)}
              className="accent-sea"
            />
            Contorno
          </label>
        </div>
      </div>
    </div>
  );
}
