import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPagamentoAtrasado } from "@/lib/email";

// Pagamentos pendentes nascem com `data` = now() (ver gerarLinkPagamento), então
// sem carência todo pagamento recém-criado já apareceria como "atrasado" no dia
// seguinte. Só avisa depois de alguns dias sem confirmação.
const CARENCIA_DIAS = 4;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - CARENCIA_DIAS);

  const pagamentosAtrasados = await prisma.pagamento.findMany({
    where: {
      pago: false,
      data: { lt: limite },
    },
    include: { cliente: true },
    orderBy: { data: "asc" },
  });

  if (pagamentosAtrasados.length > 0) {
    await sendPagamentoAtrasado(pagamentosAtrasados);
  }

  return NextResponse.json({ avisados: pagamentosAtrasados.length });
}
