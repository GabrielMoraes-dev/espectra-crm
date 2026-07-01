import { prisma } from "@/lib/prisma";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function lastNMonths(n: number) {
  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: MESES[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    leadsAtivos,
    clientesAtivos,
    projetosEmAndamento,
    projetosConcluidos,
    pagamentosDoMes,
    pagamentosPendentes,
    clientesRecentes,
    atividadesRecentes,
    clientesPorNicho,
    clientesPeriodo,
    pagamentosPeriodo,
    clientesComPrazo,
  ] = await Promise.all([
    prisma.lead.count({ where: { etapa: { notIn: ["FECHADO", "PERDIDO"] } } }),
    prisma.cliente.count({ where: { status: { not: "FINALIZADO" } } }),
    prisma.projeto.count({ where: { status: { not: "PUBLICADO" } } }),
    prisma.projeto.count({ where: { status: "PUBLICADO" } }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: true, data: { gte: startOfMonth } },
    }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: false },
    }),
    prisma.cliente.findMany({
      orderBy: { dataEntrada: "desc" },
      take: 5,
      include: { responsavel: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.cliente.groupBy({
      by: ["nicho"],
      _count: { _all: true },
    }),
    prisma.cliente.findMany({
      where: { dataEntrada: { gte: sixMonthsAgo } },
      select: { dataEntrada: true },
    }),
    prisma.pagamento.findMany({
      where: { pago: true, data: { gte: sixMonthsAgo } },
      select: { data: true, valor: true },
    }),
    prisma.cliente.findMany({
      where: { prazo: { not: null }, status: { not: "FINALIZADO" } },
    }),
  ]);

  const months = lastNMonths(6);

  const vendasPorMes = months.map((m) => ({
    mes: m.label,
    vendas: clientesPeriodo.filter(
      (c) => c.dataEntrada.getFullYear() === m.year && c.dataEntrada.getMonth() === m.month,
    ).length,
  }));

  const receitaPorMes = months.map((m) => ({
    mes: m.label,
    receita: pagamentosPeriodo
      .filter((p) => p.data.getFullYear() === m.year && p.data.getMonth() === m.month)
      .reduce((sum, p) => sum + p.valor, 0),
  }));

  let acumulado = 0;
  const crescimento = months.map((m) => {
    acumulado += clientesPeriodo.filter(
      (c) => c.dataEntrada.getFullYear() === m.year && c.dataEntrada.getMonth() === m.month,
    ).length;
    return { mes: m.label, clientes: acumulado };
  });

  const nichoData = clientesPorNicho
    .filter((n) => n.nicho)
    .map((n) => ({ nicho: n.nicho as string, total: n._count._all }))
    .sort((a, b) => b.total - a.total);

  return {
    stats: {
      leadsAtivos,
      clientesAtivos,
      projetosEmAndamento,
      projetosConcluidos,
      receitaDoMes: pagamentosDoMes._sum.valor ?? 0,
      pendencias: pagamentosPendentes._sum.valor ?? 0,
    },
    vendasPorMes,
    receitaPorMes,
    crescimento,
    nichoData,
    clientesRecentes,
    atividadesRecentes,
    clientesComPrazo,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
