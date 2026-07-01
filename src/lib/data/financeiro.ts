import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type FinanceiroFilter = {
  search?: string;
  status?: string;
  sort?: "recentes" | "antigos" | "maior-valor" | "menor-valor";
};

export async function getFinanceiroData(filter: FinanceiroFilter) {
  const where: Prisma.PagamentoWhereInput = {};

  if (filter.search) {
    where.cliente = {
      OR: [
        { nome: { contains: filter.search } },
        { empresa: { contains: filter.search } },
      ],
    };
  }

  if (filter.status === "pago") where.pago = true;
  if (filter.status === "pendente") where.pago = false;

  const orderBy: Prisma.PagamentoOrderByWithRelationInput =
    filter.sort === "antigos"
      ? { data: "asc" }
      : filter.sort === "maior-valor"
        ? { valor: "desc" }
        : filter.sort === "menor-valor"
          ? { valor: "asc" }
          : { data: "desc" };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pagamentos, receitaDoMes, receitaTotalAgg, pendentesAgg, todosPagos] = await Promise.all([
    prisma.pagamento.findMany({ where, orderBy, include: { cliente: true } }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: true, data: { gte: startOfMonth } },
    }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { pago: true } }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { pago: false } }),
    prisma.pagamento.aggregate({ _avg: { valor: true }, where: { pago: true } }),
  ]);

  return {
    pagamentos,
    resumo: {
      receitaDoMes: receitaDoMes._sum.valor ?? 0,
      receitaTotal: receitaTotalAgg._sum.valor ?? 0,
      pendentes: pendentesAgg._sum.valor ?? 0,
      ticketMedio: todosPagos._avg.valor ?? 0,
    },
  };
}
