import { NextResponse } from "next/server";
import { sendInviteEmail } from "@/lib/server/email";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string;
      clinicName?: string;
      inviteUrl?: string;
      role?: string;
    };
    if (!body.to || !body.clinicName || !body.inviteUrl) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const result = await sendInviteEmail({
      to: body.to,
      clinicName: body.clinicName,
      inviteUrl: body.inviteUrl,
      role: body.role ?? "member",
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[email/invite]", err);
    return NextResponse.json(
      { error: "Falha ao enviar convite" },
      { status: 500 },
    );
  }
}
