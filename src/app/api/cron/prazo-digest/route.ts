import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPrazoDigest } from "@/lib/email";
import { dataEmDiasBrasil } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Limite superior da consulta com 1 dia de folga — a classificação fina de
  // verdade (atrasado/hoje/próximos 7 dias) é feita abaixo comparando data civil
  // (dataEmDiasBrasil), não instante. Sem limite inferior de propósito: atrasados
  // precisam continuar visíveis, nunca escondidos ou tratados como "próximos".
  const limiteSuperiorComFolga = new Date();
  limiteSuperiorComFolga.setDate(limiteSuperiorComFolga.getDate() + 8);

  const projetos = await prisma.projeto.findMany({
    where: {
      prazo: { not: null, lte: limiteSuperiorComFolga },
      status: { not: "PUBLICADO" },
    },
    include: { cliente: true },
    orderBy: { prazo: "asc" },
  });

  const hojeDias = dataEmDiasBrasil(new Date());
  const atrasados: typeof projetos = [];
  const hoje: typeof projetos = [];
  const proximos7Dias: typeof projetos = [];

  for (const projeto of projetos) {
    const prazo = projeto.prazo!;
    const prazoDias = Date.UTC(prazo.getUTCFullYear(), prazo.getUTCMonth(), prazo.getUTCDate());
    const diffDias = Math.round((prazoDias - hojeDias) / 86_400_000);

    // Categorias mutuamente exclusivas por construção — cada projeto cai em
    // exatamente um grupo (ou em nenhum, se estiver além da janela de 7 dias).
    if (diffDias < 0) atrasados.push(projeto);
    else if (diffDias === 0) hoje.push(projeto);
    else if (diffDias <= 7) proximos7Dias.push(projeto);
  }

  const total = atrasados.length + hoje.length + proximos7Dias.length;
  if (total > 0) {
    await sendPrazoDigest({ atrasados, hoje, proximos7Dias });
  }

  return NextResponse.json({
    atrasados: atrasados.length,
    hoje: hoje.length,
    proximos7Dias: proximos7Dias.length,
  });
}
