/** Gera uma face neutra educativa (sem dados de paciente real). */
export function createDemoFaceDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#eef5f2");
  g.addColorStop(1, "#d9e4df");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e4d2c0";
  ctx.beginPath();
  ctx.ellipse(360, 470, 210, 280, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(28, 61, 57, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(360, 470, 210, 280, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(42, 56, 54, 0.55)";
  ctx.beginPath();
  ctx.ellipse(290, 420, 22, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(430, 420, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(42, 56, 54, 0.35)";
  ctx.beginPath();
  ctx.moveTo(360, 430);
  ctx.lineTo(345, 510);
  ctx.lineTo(375, 510);
  ctx.stroke();

  ctx.strokeStyle = "rgba(120, 70, 70, 0.45)";
  ctx.beginPath();
  ctx.moveTo(310, 560);
  ctx.quadraticCurveTo(360, 590, 410, 560);
  ctx.stroke();

  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = "rgba(47, 95, 88, 0.35)";
  ctx.beginPath();
  ctx.moveTo(160, 320);
  ctx.lineTo(560, 320);
  ctx.moveTo(160, 470);
  ctx.lineTo(560, 470);
  ctx.moveTo(160, 620);
  ctx.lineTo(560, 620);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(18, 26, 25, 0.7)";
  ctx.font = "20px Georgia, serif";
  ctx.fillText("Vislumbre · face demonstrativa", 36, 56);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "rgba(42, 56, 54, 0.75)";
  ctx.fillText("Sem dados de paciente · só para treinar o fluxo", 36, 82);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/** Perfil esquemático educativo para comparação dual. */
export function createDemoProfileDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#eef5f2");
  g.addColorStop(1, "#d9e4df");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e4d2c0";
  ctx.beginPath();
  ctx.moveTo(220, 180);
  ctx.bezierCurveTo(380, 160, 480, 280, 470, 420);
  ctx.bezierCurveTo(460, 560, 420, 680, 300, 760);
  ctx.bezierCurveTo(240, 700, 200, 560, 210, 420);
  ctx.bezierCurveTo(215, 300, 200, 220, 220, 180);
  ctx.fill();

  ctx.strokeStyle = "rgba(28, 61, 57, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(47, 95, 88, 0.25)";
  ctx.beginPath();
  ctx.ellipse(400, 400, 36, 28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(320, 640, 40, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(18, 26, 25, 0.7)";
  ctx.font = "18px Georgia, serif";
  ctx.fillText("Vislumbre · perfil demo", 28, 48);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "rgba(42, 56, 54, 0.75)";
  ctx.fillText("Apenas educativo", 28, 72);

  return canvas.toDataURL("image/jpeg", 0.92);
}
