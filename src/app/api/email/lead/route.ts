import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/server/email";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      clinic?: string;
      city?: string;
      message?: string;
      source?: string;
      leadId?: string;
    };
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const result = await sendLeadNotification({
      name: body.name,
      email: body.email,
      phone: body.phone ?? "",
      clinic: body.clinic ?? "",
      city: body.city ?? "",
      message: body.message ?? "",
      source: body.source ?? "site",
      leadId: body.leadId,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[email/lead]", err);
    return NextResponse.json(
      { error: "Falha ao enviar e-mail" },
      { status: 500 },
    );
  }
}
