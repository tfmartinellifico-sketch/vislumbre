import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { LandmarkPoint } from "./faceLandmarks";

const WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL,
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
  }
  return landmarkerPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar a imagem"));
    img.src = src;
  });
}

/** Detecta landmarks do rosto em foto (coordenadas normalizadas 0–1). */
export async function detectFaceLandmarks(
  imageUrl: string,
): Promise<LandmarkPoint[] | null> {
  const landmarker = await getLandmarker();
  const img = await loadImage(imageUrl);
  const result = landmarker.detect(img);
  const face = result.faceLandmarks?.[0];
  return face?.length ? face : null;
}
