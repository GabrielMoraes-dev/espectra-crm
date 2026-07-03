import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPrazoDigest } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const daquiUmaSemana = new Date();
  daquiUmaSemana.setDate(daquiUmaSemana.getDate() + 7);

  const projetos = await prisma.projeto.findMany({
    where: {
      prazo: { not: null, lte: daquiUmaSemana },
      status: { not: "PUBLICADO" },
    },
    include: { cliente: true },
    orderBy: { prazo: "asc" },
  });

  if (projetos.length > 0) {
    await sendPrazoDigest(projetos);
  }

  return NextResponse.json({ avisados: projetos.length });
}
