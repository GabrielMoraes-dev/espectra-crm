import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type AutentiqueWebhookBody = {
  event: {
    type: string;
    data: {
      id: string;
      files?: { signed?: string; certified?: string; pades?: string };
    };
  };
};

function assinaturaValida(payload: string, assinaturaRecebida: string | null) {
  const secret = process.env.AUTENTIQUE_WEBHOOK_SECRET;
  if (!secret || !assinaturaRecebida) return false;

  const esperada = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const bufA = Buffer.from(assinaturaRecebida);
  const bufB = Buffer.from(esperada);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const assinatura = request.headers.get("x-autentique-signature");

  if (!assinaturaValida(rawBody, assinatura)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as AutentiqueWebhookBody;

  if (body.event.type !== "document.finished") {
    return NextResponse.json({ ignorado: body.event.type });
  }

  const documento = body.event.data;
  const linkAssinado = documento.files?.signed ?? documento.files?.certified;

  if (!linkAssinado) {
    return NextResponse.json({ status: "sem_link_assinado" });
  }

  const cliente = await prisma.cliente.findFirst({
    where: { contratoAutentiqueId: documento.id },
  });

  if (!cliente) {
    return NextResponse.json({ status: "sem_match" });
  }

  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { contratoUrl: linkAssinado },
  });

  await prisma.timelineEvent.create({
    data: {
      clienteId: cliente.id,
      titulo: "Contrato assinado",
      descricao: "Assinatura confirmada automaticamente via Autentique.",
    },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "contrato_assinado",
      descricao: `Contrato de '${cliente.nome}' assinado automaticamente via Autentique`,
      entidadeTipo: "cliente",
      entidadeId: cliente.id,
    },
  });

  return NextResponse.json({ status: "ok", clienteId: cliente.id });
}
