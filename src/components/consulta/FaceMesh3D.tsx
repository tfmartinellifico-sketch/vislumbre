"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Mark, ScenarioId } from "@/lib/regions";
import { SCENARIOS } from "@/lib/regions";
import type { LandmarkPoint } from "@/lib/faceLandmarks";
import { applyLandmarkRelief, markOnPhotoPlane } from "@/lib/faceMesh3d";

type Props = {
  imageUrl: string;
  faceLandmarks: LandmarkPoint[];
  marks: Mark[];
  scenario: ScenarioId;
  autoRotate?: boolean;
  className?: string;
};

/**
 * Mesa 3D: a foto real como plano com relevo suave + volumes.
 * (Malha MediaPipe pura falhava visualmente; a foto é o âncora legível.)
 */
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
    const cleanups: Array<() => void> = [];

    const w = mount.clientWidth || 640;
    const h = Math.max(400, Math.round(w * 0.92));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x101816, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.05, 50);
    camera.position.set(0, 0, 3.1);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 0.55);
    key.position.set(0.4, 0.8, 2.5);
    scene.add(key);

    const root = new THREE.Group();
    scene.add(root);

    const volumes = new THREE.Group();
    root.add(volumes);

    let planeW = 1.6;
    let planeH = 2.0;

    function syncVolumes() {
      while (volumes.children.length) {
        const child = volumes.children[0];
        volumes.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const mat = child.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      }
      const mult =
        SCENARIOS.find((s) => s.id === scenarioRef.current)?.multiplier ?? 1;
      const warn = scenarioRef.current === "nao_indicado";
      marksRef.current.forEach((mark) => {
        const p = markOnPhotoPlane(mark, faceLandmarks, planeW, planeH);
        if (!p) return;
        const r = 0.055 + mark.intensity * mult * 0.09;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 28, 28),
          new THREE.MeshStandardMaterial({
            color: warn ? 0x9a4d2e : 0x2f5f58,
            transparent: true,
            opacity: 0.5,
            roughness: 0.35,
            depthWrite: false,
          }),
        );
        mesh.position.set(p.x, p.y, p.z + r * 0.35);
        volumes.add(mesh);
      });
    }

    const img = new Image();
    img.onload = () => {
      if (disposed) return;

      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      planeH = 2.05;
      planeW = planeH * Math.min(aspect, 1.15);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      cleanups.push(() => texture.dispose());

      const geo = new THREE.PlaneGeometry(planeW, planeH, 72, 96);
      const pos = geo.attributes.position;
      applyLandmarkRelief(
        pos.array as Float32Array,
        pos.count,
        faceLandmarks,
        planeW,
        planeH,
        0.48,
      );
      geo.computeVertexNormals();
      cleanups.push(() => geo.dispose());

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0,
        side: THREE.FrontSide,
      });
      cleanups.push(() => mat.dispose());

      const photo = new THREE.Mesh(geo, mat);
      root.add(photo);

      // Moldura sutil atrás
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(planeW + 0.04, planeH + 0.04),
        new THREE.MeshBasicMaterial({ color: 0x0e1615 }),
      );
      back.position.z = -0.02;
      root.add(back);
      cleanups.push(() => {
        back.geometry.dispose();
        (back.material as THREE.Material).dispose();
      });

      const banner = makeBanner();
      banner.position.set(0, -planeH * 0.5 - 0.18, 0.05);
      root.add(banner);

      syncVolumes();
    };
    img.onerror = () => {
      if (!disposed) {
        // fallback mínimo
        syncVolumes();
      }
    };
    img.src = imageUrl;

    let yaw = 0.2;
    let targetYaw = 0.2;
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
        -0.55,
        0.55,
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
        targetYaw = Math.sin(now * 0.0003) * 0.26;
      }
      yaw += (targetYaw - yaw) * Math.min(1, dt * 7);
      root.rotation.y = yaw;
      root.rotation.x = -0.03;
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
  }, [faceLandmarks, imageUrl]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink ${className}`}>
      <div ref={mountRef} className="w-full" />
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[11px] text-mist/90">
        Arraste para girar · sua foto em volume · não é o resultado
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
  return new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.26), mat);
}
