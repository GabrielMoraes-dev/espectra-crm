import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResumoSemanal } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

  const [novosLeads, novosClientes, pagamentosSemana, tarefasConcluidas] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: umaSemanaAtras } } }),
    prisma.cliente.count({ where: { createdAt: { gte: umaSemanaAtras }, deletedAt: null } }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: true, data: { gte: umaSemanaAtras } },
    }),
    prisma.tarefa.count({ where: { status: "CONCLUIDA", updatedAt: { gte: umaSemanaAtras } } }),
  ]);

  const resumo = {
    novosLeads,
    novosClientes,
    receitaSemana: pagamentosSemana._sum.valor ?? 0,
    tarefasConcluidas,
  };

  await sendResumoSemanal(resumo);

  return NextResponse.json(resumo);
}
