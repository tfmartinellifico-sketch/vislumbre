"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import type { LandmarkPoint } from "@/lib/faceLandmarks";
import {
  landmarksToCentered,
  markToVec3,
  trianglesFromConnections,
} from "@/lib/faceMesh3d";

type Props = {
  imageUrl: string;
  faceLandmarks: LandmarkPoint[];
  marks: Mark[];
  scenario: ScenarioId;
  autoRotate?: boolean;
  className?: string;
};

export function FaceMesh3D({
  imageUrl,
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

    let disposed = false;
    let raf = 0;
    const disposables: { dispose: () => void }[] = [];

    const w = mount.clientWidth || 640;
    const h = Math.max(380, Math.round(w * 0.9));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x121a19, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    camera.position.set(0, 0.02, 2.85);

    scene.add(new THREE.HemisphereLight(0xfff6ec, 0x1c3d39, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(0.5, 1.1, 2.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c4bc, 0.4);
    fill.position.set(-1.4, 0.3, 1.2);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    const { positions, uvs } = landmarksToCentered(faceLandmarks);
    const tris = trianglesFromConnections(
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      faceLandmarks.length,
    );

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(tris, 1));
    geo.computeVertexNormals();
    disposables.push(geo);

    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        disposables.push(texture);

        const mat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.78,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
        disposables.push(mat);
        const head = new THREE.Mesh(geo, mat);
        root.add(head);
      },
      undefined,
      () => {
        if (disposed) return;
        const mat = new THREE.MeshStandardMaterial({
          color: 0xc9b8a4,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        disposables.push(mat);
        root.add(new THREE.Mesh(geo, mat));
      },
    );

    // Contornos legíveis (rosto, olhos, boca)
    const contourGroups = [
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      FaceLandmarker.FACE_LANDMARKS_LIPS,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
    ];
    const contourPos: number[] = [];
    for (const group of contourGroups) {
      for (const c of group) {
        const a = c.start;
        const b = c.end;
        if (a * 3 + 2 >= positions.length || b * 3 + 2 >= positions.length) {
          continue;
        }
        contourPos.push(
          positions[a * 3],
          positions[a * 3 + 1],
          positions[a * 3 + 2] + 0.002,
          positions[b * 3],
          positions[b * 3 + 1],
          positions[b * 3 + 2] + 0.002,
        );
      }
    }
    const contourGeo = new THREE.BufferGeometry();
    contourGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(contourPos, 3),
    );
    const contourMat = new THREE.LineBasicMaterial({
      color: 0x1c3d39,
      transparent: true,
      opacity: 0.35,
    });
    disposables.push(contourGeo, contourMat);
    root.add(new THREE.LineSegments(contourGeo, contourMat));

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
        const r = 0.04 + mark.intensity * mult * 0.07;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 20, 20),
          new THREE.MeshStandardMaterial({
            color: warn ? 0x9a4d2e : 0x2f5f58,
            transparent: true,
            opacity: 0.48,
            roughness: 0.3,
            depthWrite: false,
          }),
        );
        mesh.position.set(v[0], v[1], v[2]);
        volumes.add(mesh);
      });
    }
    syncVolumes();

    const banner = makeBanner();
    banner.position.set(0, -1.05, 0.15);
    root.add(banner);

    let yaw = 0.22;
    let targetYaw = 0.22;
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
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetYaw = THREE.MathUtils.clamp(targetYaw + dx * 0.005, -0.6, 0.6);
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
      if (!mount) return;
      const nw = mount.clientWidth || 640;
      const nh = Math.max(380, Math.round(nw * 0.9));
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
        targetYaw = Math.sin(now * 0.00032) * 0.28;
      }
      yaw += (targetYaw - yaw) * Math.min(1, dt * 6);
      root.rotation.y = yaw;
      root.rotation.x = -0.04;
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
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [faceLandmarks, imageUrl]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink ${className}`}>
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
    ctx.fillStyle = "rgba(14, 22, 21, 0.88)";
    ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = "#fafcfb";
    ctx.font = "600 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Demonstração · não é resultado", 512, 78);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.28), mat);
}
