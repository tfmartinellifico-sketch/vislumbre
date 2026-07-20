"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";

type Props = {
  marks: Mark[];
  scenario: ScenarioId;
};

type XrMode = "unsupported" | "ready" | "session" | "error";

export function GlassesAr({ marks, scenario }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marksRef = useRef(marks);
  const scenarioRef = useRef(scenario);
  const [mode, setMode] = useState<XrMode>("unsupported");
  const [message, setMessage] = useState(
    "Verificando suporte a óculos / WebXR…",
  );
  const [supported, setSupported] = useState<{ ar: boolean; vr: boolean }>({
    ar: false,
    vr: false,
  });

  useEffect(() => {
    marksRef.current = marks;
    scenarioRef.current = scenario;
  }, [marks, scenario]);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const xr = navigator.xr;
      if (!xr) {
        if (!cancelled) {
          setMode("unsupported");
          setMessage(
            "Este navegador não expõe WebXR. Use Meta Quest Browser, headset compatível, ou o modo celular.",
          );
        }
        return;
      }
      const ar = await xr.isSessionSupported("immersive-ar").catch(() => false);
      const vr = await xr.isSessionSupported("immersive-vr").catch(() => false);
      if (cancelled) return;
      setSupported({ ar, vr });
      if (ar || vr) {
        setMode("ready");
        setMessage(
          ar
            ? "Óculos / WebXR AR detectado. Entre na sessão imersiva."
            : "WebXR VR detectado. Entre na sala imersiva (demonstração educativa).",
        );
      } else {
        setMode("unsupported");
        setMessage(
          "Nenhum modo imersivo disponível neste dispositivo. No PC, o modo celular continua ativo; nos óculos, abra este link no browser do headset.",
        );
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enterSession(preferAr: boolean) {
    const canvas = canvasRef.current;
    const xr = navigator.xr;
    if (!canvas || !xr) return;

    const sessionMode: XRSessionMode | null =
      preferAr && supported.ar
        ? "immersive-ar"
        : supported.vr
          ? "immersive-vr"
          : supported.ar
            ? "immersive-ar"
            : null;

    if (!sessionMode) {
      setMode("error");
      setMessage("Não foi possível iniciar sessão WebXR.");
      return;
    }

    try {
      const session = await xr.requestSession(sessionMode, {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
      });

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 40);
      const light = new THREE.HemisphereLight(0xf2f7f5, 0x1c3d39, 1.1);
      scene.add(light);

      const root = new THREE.Group();
      root.position.set(0, 1.35, -1.05);
      scene.add(root);

      const face = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 48, 48),
        new THREE.MeshStandardMaterial({
          color: 0xe4d2c0,
          roughness: 0.75,
          metalness: 0.05,
        }),
      );
      face.scale.set(0.85, 1.1, 0.9);
      root.add(face);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.004, 12, 80),
        new THREE.MeshBasicMaterial({ color: 0x2f5f58, transparent: true, opacity: 0.55 }),
      );
      ring.rotation.x = Math.PI / 2;
      root.add(ring);

      const blobMeshes: THREE.Mesh[] = [];
      function syncBlobs() {
        blobMeshes.forEach((m) => root.remove(m));
        blobMeshes.length = 0;
        const mult =
          SCENARIOS.find((s) => s.id === scenarioRef.current)?.multiplier ?? 1;
        const warn = scenarioRef.current === "nao_indicado";
        marksRef.current.forEach((mark) => {
          const size = 0.035 + mark.intensity * mult * 0.07;
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(size, 24, 24),
            new THREE.MeshStandardMaterial({
              color: warn ? 0x9a4d2e : 0x2f5f58,
              transparent: true,
              opacity: 0.45,
              roughness: 0.4,
            }),
          );
          mesh.position.set(
            (mark.x - 0.5) * 0.32,
            (0.5 - mark.y) * 0.4,
            0.18,
          );
          root.add(mesh);
          blobMeshes.push(mesh);
        });
      }
      syncBlobs();

      const label = makeLabelSprite(
        "Vislumbre · demonstração educativa · não é resultado",
      );
      label.position.set(0, 0.42, 0);
      root.add(label);

      setMode("session");
      setMessage("Sessão imersiva ativa. Remova os óculos ou encerre no headset para sair.");

      const onEnd = () => {
        setMode("ready");
        setMessage("Sessão encerrada. Você pode entrar novamente.");
        renderer.dispose();
      };
      session.addEventListener("end", onEnd);

      renderer.setAnimationLoop(() => {
        syncBlobs();
        root.rotation.y = Math.sin(performance.now() * 0.0004) * 0.08;
        renderer.render(scene, camera);
      });
    } catch (err) {
      console.error(err);
      setMode("error");
      setMessage(
        "Falha ao entrar no WebXR. Confirme permissões do headset e tente no browser nativo dos óculos.",
      );
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-ink/10 bg-ink">
        <canvas ref={canvasRef} className="block h-56 w-full md:h-72" />
        {mode !== "session" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 px-6 text-center">
            <p className="display text-2xl text-paper">Óculos AR / XR</p>
            <p className="max-w-md text-xs leading-relaxed text-mist">{message}</p>
            {(supported.ar || supported.vr) && mode !== "error" && (
              <div className="flex flex-wrap justify-center gap-2">
                {supported.ar && (
                  <button
                    type="button"
                    onClick={() => enterSession(true)}
                    className="rounded-md bg-sea px-4 py-2 text-sm text-paper"
                  >
                    Entrar em AR (óculos)
                  </button>
                )}
                {supported.vr && (
                  <button
                    type="button"
                    onClick={() => enterSession(false)}
                    className="rounded-md border border-paper/30 px-4 py-2 text-sm text-paper"
                  >
                    Entrar em VR imersivo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <CompatNotes />
    </div>
  );
}

function CompatNotes() {
  return (
    <div className="rounded-xl border border-ink/10 bg-fog/80 px-4 py-3.5 text-[12px] leading-relaxed text-ink-soft">
      <p className="font-medium text-ink">Quando usar óculos</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4">
        <li>
          <strong className="text-ink">Meta Quest</strong> — abra este link no
          navegador do óculos e entre na sessão.
        </li>
        <li>
          <strong className="text-ink">Vision Pro</strong> — se o botão não
          aparecer, use o modo celular nesta mesma etapa.
        </li>
        <li>
          <strong className="text-ink">Computador</strong> — em geral fica no modo
          celular; o imersivo só aparece com óculos compatíveis.
        </li>
      </ul>
      <p className="mt-2.5">
        Nos óculos, os volumes também são só para conversa — não são o resultado
        do procedimento.
      </p>
    </div>
  );
}

function makeLabelSprite(text: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(18,26,25,0.72)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#f2f7f5";
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, c.width / 2, 76);
  }
  const map = new THREE.CanvasTexture(c);
  const material = new THREE.SpriteMaterial({ map, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.9, 0.12, 1);
  return sprite;
}
