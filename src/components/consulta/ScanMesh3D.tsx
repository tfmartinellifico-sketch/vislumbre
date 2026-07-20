"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";

type Props = {
  /** Object URL ou data URL do arquivo Sense (OBJ / PLY / STL). */
  scanUrl: string;
  fileName: string;
  marks: Mark[];
  scenario: ScenarioId;
  autoRotate?: boolean;
  className?: string;
};

/**
 * Viewer da malha do Sense (1ª gen): OBJ/PLY com cor por vértice, ou STL.
 */
export function ScanMesh3D({
  scanUrl,
  fileName,
  marks,
  scenario,
  autoRotate = true,
  className = "",
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef(marks);
  const scenarioRef = useRef(scenario);
  const autoRef = useRef(autoRotate);

  useEffect(() => {
    marksRef.current = marks;
    scenarioRef.current = scenario;
    autoRef.current = autoRotate;
  }, [marks, scenario, autoRotate]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    const cleanups: Array<() => void> = [];

    const w = mount.clientWidth || 640;
    const h = Math.max(400, Math.round(w * 0.92));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x101816, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.01, 100);
    camera.position.set(0, 0.05, 2.6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.75);
    key.position.set(0.6, 1.2, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb8d0c8, 0.35);
    fill.position.set(-1.2, 0.2, 1);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);
    const volumes = new THREE.Group();
    root.add(volumes);

    let bboxSize = new THREE.Vector3(1, 1.2, 0.8);
    let bboxCenter = new THREE.Vector3();

    function syncVolumes() {
      while (volumes.children.length) {
        const child = volumes.children[0];
        volumes.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const m = child.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      }
      const mult =
        SCENARIOS.find((s) => s.id === scenarioRef.current)?.multiplier ?? 1;
      const warn = scenarioRef.current === "nao_indicado";
      const sx = bboxSize.x;
      const sy = bboxSize.y;
      const sz = bboxSize.z;

      marksRef.current.forEach((mark) => {
        const r = Math.max(sx, sy) * (0.028 + mark.intensity * mult * 0.04);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 24),
          new THREE.MeshStandardMaterial({
            color: warn ? 0x9a4d2e : 0x2f5f58,
            transparent: true,
            opacity: 0.52,
            roughness: 0.35,
            depthWrite: false,
          }),
        );
        // UV do roteiro → caixa da malha (frente do rosto)
        mesh.position.set(
          (mark.x - 0.5) * sx * 0.85,
          (0.5 - mark.y) * sy * 0.85,
          sz * 0.42 + r * 0.4,
        );
        volumes.add(mesh);
      });
    }

    async function loadScan() {
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      const res = await fetch(scanUrl);
      const buffer = await res.arrayBuffer();
      if (disposed) return;

      let object: THREE.Object3D;

      if (ext === "ply") {
        const geo = new PLYLoader().parse(buffer);
        geo.computeVertexNormals();
        const hasColor = Boolean(geo.getAttribute("color"));
        const mat = new THREE.MeshStandardMaterial({
          vertexColors: hasColor,
          color: hasColor ? 0xffffff : 0xc9b8a4,
          roughness: 0.72,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
        object = new THREE.Mesh(geo, mat);
        cleanups.push(() => {
          geo.dispose();
          mat.dispose();
        });
      } else if (ext === "stl") {
        const geo = new STLLoader().parse(buffer);
        geo.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({
          color: 0xc9b8a4,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        object = new THREE.Mesh(geo, mat);
        cleanups.push(() => {
          geo.dispose();
          mat.dispose();
        });
      } else {
        // OBJ (texto)
        const text = new TextDecoder().decode(buffer);
        const group = new OBJLoader().parse(text);
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geo = child.geometry as THREE.BufferGeometry;
            geo.computeVertexNormals();
            const hasColor = Boolean(geo.getAttribute("color"));
            child.material = new THREE.MeshStandardMaterial({
              vertexColors: hasColor,
              color: hasColor ? 0xffffff : 0xc9b8a4,
              roughness: 0.72,
              metalness: 0.02,
              side: THREE.DoubleSide,
            });
            cleanups.push(() => {
              geo.dispose();
              (child.material as THREE.Material).dispose();
            });
          }
        });
        object = group;
      }

      // Centraliza e escala para caber na vista
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 1.85 / maxDim;
      object.position.sub(center);
      object.scale.setScalar(scale);

      root.add(object);

      const scaledBox = new THREE.Box3().setFromObject(object);
      bboxSize = scaledBox.getSize(new THREE.Vector3());
      bboxCenter = scaledBox.getCenter(new THREE.Vector3());
      void bboxCenter;

      // Sense costuma vir “deitado” ou de costas — leve correção comum
      root.rotation.x = -0.08;

      const banner = makeBanner();
      banner.position.set(0, -bboxSize.y * 0.55 - 0.15, 0);
      root.add(banner);

      syncVolumes();
    }

    loadScan().catch(() => {
      /* erro silencioso — UI acima trata */
    });

    let yaw = 0.25;
    let targetYaw = 0.25;
    let dragging = false;
    let lastX = 0;

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      targetYaw = THREE.MathUtils.clamp(
        targetYaw + (e.clientX - lastX) * 0.005,
        -0.85,
        0.85,
      );
      lastX = e.clientX;
    }
    function onPointerUp(e: PointerEvent) {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);

    const onResize = () => {
      const nw = mount.clientWidth || 640;
      const nh = Math.max(400, Math.round(nw * 0.92));
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    let t0 = performance.now();
    function tick(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      syncVolumes();
      if (!dragging && autoRef.current) {
        targetYaw = Math.sin(now * 0.00028) * 0.35;
      }
      yaw += (targetYaw - yaw) * Math.min(1, dt * 7);
      root.rotation.y = yaw;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      cleanups.forEach((fn) => fn());
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [scanUrl, fileName]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink ${className}`}>
      <div ref={mountRef} className="w-full" />
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[11px] text-mist/90">
        Scan Sense · arraste para girar · demonstração — não é o resultado
      </p>
    </div>
  );
}

function makeBanner() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(14, 22, 21, 0.9)";
    ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = "#fafcfb";
    ctx.font = "600 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan 3D · demonstração · não é resultado", 512, 78);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.28), mat);
}
