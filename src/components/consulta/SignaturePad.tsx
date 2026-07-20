"use client";

import { useCallback, useRef } from "react";

type Props = {
  onChange: (dataUrl: string | null) => void;
};

/** Assinatura opcional da paciente no registro da conversa. */
export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const p = getPos(e);
    if (!canvas || !ctx || !p) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.strokeStyle = "#0e1615";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = getPos(e);
    if (!ctx || !p) return;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-ink">
          Assinatura da paciente (opcional)
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] text-sea-deep hover:underline"
        >
          Limpar
        </button>
      </div>
      <p className="text-[11px] text-ink-soft">
        Confirma que viu a demonstração e entendeu que não é o resultado.
      </p>
      <canvas
        ref={canvasRef}
        width={560}
        height={160}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-xl border border-dashed border-ink/20 bg-fog/80"
      />
    </div>
  );
}
