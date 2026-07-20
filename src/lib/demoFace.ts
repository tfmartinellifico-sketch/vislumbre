/**
 * Faces demonstrativas (sem dados de paciente real).
 * Carrega ilustrações estáticas e aplica marca-d'água educativa.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function illustrationToDataUrl(
  src: string,
  title: string,
  subtitle: string,
): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(img, 0, 0);

  const scale = canvas.width / 720;
  ctx.fillStyle = "rgba(18, 26, 25, 0.7)";
  ctx.font = `${Math.round(20 * scale)}px Georgia, serif`;
  ctx.fillText(title, 36 * scale, 56 * scale);
  ctx.font = `${Math.round(14 * scale)}px sans-serif`;
  ctx.fillStyle = "rgba(42, 56, 54, 0.75)";
  ctx.fillText(subtitle, 36 * scale, 84 * scale);

  return canvas.toDataURL("image/jpeg", 0.9);
}

/** Face frontal neutra educativa. */
export function createDemoFaceDataUrl(): Promise<string> {
  return illustrationToDataUrl(
    "/illustrations/demo-front.webp",
    "Vislumbre · face demonstrativa",
    "Sem dados de paciente · só para treinar o fluxo",
  );
}

/** Perfil esquemático educativo para comparação dual. */
export function createDemoProfileDataUrl(): Promise<string> {
  return illustrationToDataUrl(
    "/illustrations/demo-profile.webp",
    "Vislumbre · perfil demo",
    "Apenas educativo",
  );
}
