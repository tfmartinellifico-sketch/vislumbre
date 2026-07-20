import { NextResponse } from "next/server";
import { sendDemoRejectionEmail } from "@/lib/server/email";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string;
      name?: string;
      company?: string;
    };
    if (!body.to || !body.name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const result = await sendDemoRejectionEmail({
      to: body.to,
      name: body.name,
      company: body.company,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[email/demo-reject]", err);
    return NextResponse.json(
      { error: "Falha ao enviar e-mail" },
      { status: 500 },
    );
  }
}
