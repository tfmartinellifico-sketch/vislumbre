"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import type { LandmarkPoint } from "@/lib/faceLandmarks";
import { landmarksToCentered, markToVec3 } from "@/lib/faceMesh3d";

type Props = {
  faceLandmarks: LandmarkPoint[];
  marks: Mark[];
  scenario: ScenarioId;
  autoRotate?: boolean;
  className?: string;
};

export function FaceMesh3D({
  faceLandmarks,
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
    if (!mount || !faceLandmarks.length) return;

    const w = mount.clientWidth || 640;
    const h = Math.max(360, Math.round(w * 0.85));

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x0e1615, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    camera.position.set(0, 0.05, 3.2);

    const hemi = new THREE.HemisphereLight(0xf5f0e8, 0x1c3d39, 1.05);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(0.6, 1.2, 2.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9bb8b0, 0.35);
    fill.position.set(-1.2, 0.2, 1);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    const { positions } = landmarksToCentered(faceLandmarks);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < faceLandmarks.length; i += 1) {
      // Amostra densa o bastante para o convex hull sem todos os 478
      if (i % 2 !== 0 && i > 50) continue;
      points.push(
        new THREE.Vector3(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2],
        ),
      );
    }

    let head: THREE.Mesh | null = null;
    try {
      const geo = new ConvexGeometry(points);
      head = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: 0xc4b5a0,
          roughness: 0.72,
          metalness: 0.05,
          transparent: true,
          opacity: 0.92,
          flatShading: true,
        }),
      );
      root.add(head);
    } catch {
      // fallback: pontos
    }

    const wirePositions: number[] = [];
    const connections = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
    for (const c of connections) {
      const a = c.start;
      const b = c.end;
      if (a * 3 + 2 >= positions.length || b * 3 + 2 >= positions.length) continue;
      if (a % 3 !== 0) continue; // aliviar densidade da wire
      wirePositions.push(
        positions[a * 3],
        positions[a * 3 + 1],
        positions[a * 3 + 2],
        positions[b * 3],
        positions[b * 3 + 1],
        positions[b * 3 + 2],
      );
    }
    const wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(wirePositions, 3),
    );
    const wire = new THREE.LineSegments(
      wireGeo,
      new THREE.LineBasicMaterial({
        color: 0x2f5f58,
        transparent: true,
        opacity: 0.28,
      }),
    );
    root.add(wire);

    const volumes = new THREE.Group();
    root.add(volumes);

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
      marksRef.current.forEach((mark) => {
        const v = markToVec3(mark, faceLandmarks, positions);
        if (!v) return;
        const r = 0.045 + mark.intensity * mult * 0.08;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 24),
          new THREE.MeshStandardMaterial({
            color: warn ? 0x9a4d2e : 0x2f5f58,
            transparent: true,
            opacity: 0.42,
            roughness: 0.35,
            depthWrite: false,
          }),
        );
        mesh.position.set(v[0], v[1], v[2]);
        volumes.add(mesh);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r * 1.05, 0.006, 8, 48),
          new THREE.MeshBasicMaterial({
            color: warn ? 0x9a4d2e : 0x245750,
            transparent: true,
            opacity: 0.75,
          }),
        );
        ring.position.copy(mesh.position);
        ring.lookAt(camera.position);
        volumes.add(ring);
      });
    }
    syncVolumes();

    const banner = makeBanner();
    banner.position.set(0, -1.15, 0.2);
    root.add(banner);

    let yaw = 0.18;
    let targetYaw = 0.18;
    let dragging = false;
    let lastX = 0;
    let raf = 0;
    let disposed = false;

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetYaw = THREE.MathUtils.clamp(targetYaw + dx * 0.005, -0.55, 0.55);
    }
    function onPointerUp(e: PointerEvent) {
      dragging = false;
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
      if (!mount) return;
      const nw = mount.clientWidth || 640;
      const nh = Math.max(360, Math.round(nw * 0.85));
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
        targetYaw = Math.sin(now * 0.00035) * 0.32;
      }
      yaw += (targetYaw - yaw) * Math.min(1, dt * 6);
      root.rotation.y = yaw;
      root.rotation.x = -0.06;
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
      renderer.dispose();
      if (head) {
        head.geometry.dispose();
        (head.material as THREE.Material).dispose();
      }
      wireGeo.dispose();
      (wire.material as THREE.Material).dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [faceLandmarks]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mountRef} className="w-full" />
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[11px] text-mist/90">
        Arraste para girar · demonstração para conversa — não é o resultado
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
    ctx.fillStyle = "rgba(14, 22, 21, 0.85)";
    ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = "#fafcfb";
    ctx.font = "600 42px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Demonstração · não é resultado", 512, 78);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.3), mat);
  return mesh;
}
