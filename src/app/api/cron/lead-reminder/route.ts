import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStaleLeadReminder } from "@/lib/email";

const DIAS_LIMITE = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_LIMITE);

  const leadsParados = await prisma.lead.findMany({
    where: {
      etapa: { notIn: ["FECHADO", "PERDIDO"] },
      linkCopiadoEm: { not: null, lte: limite },
      briefings: { none: {} },
    },
    orderBy: { linkCopiadoEm: "asc" },
  });

  if (leadsParados.length > 0) {
    await sendStaleLeadReminder(leadsParados);
  }

  return NextResponse.json({ avisados: leadsParados.length });
}
