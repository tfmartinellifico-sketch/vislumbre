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

  // cabelo
  ctx.fillStyle = "#4a3d35";
  ctx.beginPath();
  ctx.ellipse(360, 320, 200, 240, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // rosto
  ctx.fillStyle = "#e8d4c0";
  ctx.beginPath();
  ctx.ellipse(360, 480, 195, 255, 0, 0, Math.PI * 2);
  ctx.fill();

  // blush
  ctx.fillStyle = "rgba(196, 132, 122, 0.12)";
  ctx.beginPath();
  ctx.ellipse(270, 500, 55, 35, 0, 0, Math.PI * 2);
  ctx.ellipse(450, 500, 55, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(28, 61, 57, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(360, 480, 195, 255, 0, 0, Math.PI * 2);
  ctx.stroke();

  // sobrancelhas
  ctx.strokeStyle = "rgba(74, 64, 56, 0.5)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(285, 400);
  ctx.quadraticCurveTo(315, 388, 335, 395);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(385, 395);
  ctx.quadraticCurveTo(405, 388, 435, 400);
  ctx.stroke();

  // olhos
  ctx.fillStyle = "#faf8f5";
  ctx.beginPath();
  ctx.ellipse(310, 435, 32, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(410, 435, 32, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a4038";
  ctx.beginPath();
  ctx.arc(312, 437, 14, 0, Math.PI * 2);
  ctx.arc(412, 437, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(318, 432, 4, 0, Math.PI * 2);
  ctx.arc(418, 432, 4, 0, Math.PI * 2);
  ctx.fill();

  // nariz
  ctx.strokeStyle = "rgba(154, 115, 88, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(360, 448);
  ctx.lineTo(348, 510);
  ctx.quadraticCurveTo(360, 518, 372, 510);
  ctx.stroke();

  // lábios
  ctx.fillStyle = "rgba(196, 132, 122, 0.55)";
  ctx.beginPath();
  ctx.moveTo(320, 575);
  ctx.quadraticCurveTo(360, 595, 400, 575);
  ctx.quadraticCurveTo(360, 585, 320, 575);
  ctx.fill();

  // volumes consulta (tracejados)
  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = "rgba(47, 95, 88, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(270, 520, 58, 42, 0, 0, Math.PI * 2);
  ctx.ellipse(450, 520, 58, 42, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(47, 95, 88, 0.12)";
  ctx.beginPath();
  ctx.ellipse(270, 520, 58, 42, 0, 0, Math.PI * 2);
  ctx.ellipse(450, 520, 58, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = "rgba(47, 95, 88, 0.25)";
  ctx.beginPath();
  ctx.moveTo(160, 320);
  ctx.lineTo(560, 320);
  ctx.moveTo(160, 480);
  ctx.lineTo(560, 480);
  ctx.moveTo(160, 640);
  ctx.lineTo(560, 640);
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

  ctx.fillStyle = "#3d3028";
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.bezierCurveTo(280, 160, 420, 180, 440, 260);
  ctx.lineTo(420, 280);
  ctx.bezierCurveTo(380, 220, 260, 210, 220, 240);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e8d4c0";
  ctx.beginPath();
  ctx.moveTo(220, 180);
  ctx.bezierCurveTo(380, 160, 480, 280, 470, 420);
  ctx.bezierCurveTo(460, 560, 420, 680, 300, 760);
  ctx.bezierCurveTo(240, 700, 200, 560, 210, 420);
  ctx.bezierCurveTo(215, 300, 200, 220, 220, 180);
  ctx.fill();

  ctx.strokeStyle = "rgba(28, 61, 57, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(74, 64, 56, 0.45)";
  ctx.beginPath();
  ctx.ellipse(395, 380, 8, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(47, 95, 88, 0.18)";
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = "rgba(47, 95, 88, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(400, 400, 36, 28, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.ellipse(400, 400, 36, 28, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(47, 95, 88, 0.15)";
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
