import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPagamentoAtrasado } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const pagamentosAtrasados = await prisma.pagamento.findMany({
    where: {
      pago: false,
      data: { lt: new Date() },
    },
    include: { cliente: true },
    orderBy: { data: "asc" },
  });

  if (pagamentosAtrasados.length > 0) {
    await sendPagamentoAtrasado(pagamentosAtrasados);
  }

  return NextResponse.json({ avisados: pagamentosAtrasados.length });
}
