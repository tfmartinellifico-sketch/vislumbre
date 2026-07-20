"use client";

import { useEffect, useRef, useState } from "react";

type Angle = "front" | "profile";

type Props = {
  onCapture: (dataUrl: string, angle: Angle) => void;
  hasFront: boolean;
  hasProfile: boolean;
};

export function GuidedCapture({ onCapture, hasFront, hasProfile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [angle, setAngle] = useState<Angle>("front");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        setError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch {
        setError(
          "Não foi possível abrir a câmera. Permita o acesso ou envie a foto pelos arquivos.",
        );
      }
    }

    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  function capture() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Espelha a frontal (como o paciente se vê); perfil sem espelho
    if (angle === "front") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);

    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onCapture(dataUrl, angle);

    if (angle === "front" && !hasProfile) {
      setAngle("profile");
    } else {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setAngle(hasFront && !hasProfile ? "profile" : "front");
          setOpen(true);
        }}
        className="w-full rounded-xl bg-sea-deep px-4 py-3.5 text-[13px] text-paper transition hover:bg-sea"
      >
        {hasFront
          ? "Abrir câmera guiada (ajustar / perfil)"
          : "Abrir câmera com moldura"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setAngle("front")}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] ${
            angle === "front"
              ? "bg-sea-deep text-paper"
              : "border border-ink/10 text-ink-soft"
          }`}
        >
          Frontal {hasFront ? "✓" : ""}
        </button>
        <button
          type="button"
          onClick={() => setAngle("profile")}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] ${
            angle === "profile"
              ? "bg-sea-deep text-paper"
              : "border border-ink/10 text-ink-soft"
          }`}
        >
          Perfil {hasProfile ? "✓" : ""}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-warn/30 bg-warn/[0.05] px-3.5 py-3 text-[13px] text-warn">
          {error}
        </p>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-ink aspect-[3/4]">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover ${
              angle === "front" ? "scale-x-[-1]" : ""
            }`}
          />
          {flash && <div className="absolute inset-0 bg-paper/80" />}

          {/* Escurecimento + moldura */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 300 400"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <mask id="capture-mask">
                <rect width="300" height="400" fill="white" />
                {angle === "front" ? (
                  <ellipse cx="150" cy="190" rx="88" ry="118" fill="black" />
                ) : (
                  <ellipse cx="168" cy="190" rx="70" ry="118" fill="black" />
                )}
              </mask>
            </defs>
            <rect
              width="300"
              height="400"
              fill="rgba(14,22,21,0.55)"
              mask="url(#capture-mask)"
            />
            {angle === "front" ? (
              <ellipse
                cx="150"
                cy="190"
                rx="88"
                ry="118"
                fill="none"
                stroke="rgba(250,252,251,0.85)"
                strokeWidth="1.5"
                strokeDasharray="6 5"
              />
            ) : (
              <ellipse
                cx="168"
                cy="190"
                rx="70"
                ry="118"
                fill="none"
                stroke="rgba(250,252,251,0.85)"
                strokeWidth="1.5"
                strokeDasharray="6 5"
              />
            )}
            {/* Guias horizontais olhos / boca */}
            <line
              x1={angle === "front" ? 78 : 110}
              y1="155"
              x2={angle === "front" ? 222 : 226}
              y2="155"
              stroke="rgba(203,184,154,0.55)"
              strokeWidth="0.8"
            />
            <line
              x1={angle === "front" ? 95 : 125}
              y1="230"
              x2={angle === "front" ? 205 : 210}
              y2="230"
              stroke="rgba(203,184,154,0.35)"
              strokeWidth="0.8"
            />
          </svg>

          <div className="absolute inset-x-0 top-0 px-3 pt-3">
            <p className="rounded-lg bg-ink/55 px-3 py-2 text-center text-[12px] leading-snug text-mist backdrop-blur-sm">
              {angle === "front"
                ? "Centralize o rosto na oval. Luz de frente, expressão neutra."
                : "Vire o rosto a ~90°. Queixo e fronte dentro da moldura."}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost flex-1 !py-2.5"
        >
          Fechar
        </button>
        <button
          type="button"
          onClick={capture}
          disabled={Boolean(error)}
          className="btn-primary flex-[1.4] !py-2.5 disabled:opacity-40"
        >
          Capturar {angle === "front" ? "frontal" : "perfil"}
        </button>
      </div>
    </div>
  );
}
