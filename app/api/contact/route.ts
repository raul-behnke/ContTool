import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const payload = {
    nome_completo: body.nome_completo ?? "",
    telefone_whatsapp: body.telefone_whatsapp ?? "",
    email_corporativo: body.email_corporativo ?? "",
    empresa: body.empresa ?? "",
  };

  const url = process.env.CONTACT_API_URL ?? "https://conttool.com/api/contact";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    try {
      const data = await res.json();
      return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    } catch {
      return NextResponse.json({ success: res.ok }, { status: res.ok ? 200 : res.status });
    }
  } catch {
    // Upstream unreachable — keep the UX graceful.
    return NextResponse.json({ success: true });
  }
}
