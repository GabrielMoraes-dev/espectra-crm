import { prisma } from "@/lib/prisma";
import { ETAPA_LEAD_CONFIG, ETAPA_LEAD_ORDEM } from "@/lib/constants";

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
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    leadsAtivos,
    clientesAtivos,
    projetosEmAndamento,
    projetosConcluidos,
    pagamentosDoMes,
    pagamentosDoMesAnterior,
    pagamentosPendentes,
    clientesRecentes,
    atividadesRecentes,
    clientesPorNicho,
    clientesPeriodo,
    pagamentosPeriodo,
    clientesComPrazo,
    clientesPendencia,
    pagamentosSemMatch,
    clientesParaVincular,
    configuracao,
    leadsPorEtapaRaw,
  ] = await Promise.all([
    prisma.lead.count({ where: { etapa: { notIn: ["FECHADO", "PERDIDO"] } } }),
    prisma.cliente.count({ where: { status: { not: "FINALIZADO" }, deletedAt: null } }),
    prisma.projeto.count({ where: { status: { not: "PUBLICADO" } } }),
    prisma.projeto.count({ where: { status: "PUBLICADO" } }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: true, data: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: true, data: { gte: startOfPrevMonth, lt: startOfMonth } },
    }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { pago: false },
    }),
    prisma.cliente.findMany({
      where: { deletedAt: null },
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
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.cliente.findMany({
      where: { dataEntrada: { gte: sixMonthsAgo }, deletedAt: null },
      select: { dataEntrada: true },
    }),
    prisma.pagamento.findMany({
      where: { pago: true, data: { gte: sixMonthsAgo } },
      select: { data: true, valor: true },
    }),
    prisma.cliente.findMany({
      where: { prazo: { not: null }, status: { not: "FINALIZADO" }, deletedAt: null },
    }),
    prisma.cliente.findMany({
      where: {
        status: { not: "FINALIZADO" },
        deletedAt: null,
        OR: [
          { contratoUrl: null, pagamentos: { some: { pago: true } } },
          { contratoUrl: { not: null }, pagamentos: { none: { pago: true } } },
        ],
      },
      select: { id: true, nome: true, empresa: true, contratoUrl: true },
    }),
    prisma.pagamentoSemMatch.findMany({
      where: { resolvido: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cliente.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.configuracaoEmpresa.findFirst(),
    prisma.lead.groupBy({ by: ["etapa"], _count: { _all: true } }),
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

  const pendenciasContratoPagamento = clientesPendencia.map((c) => ({
    id: c.id,
    nome: c.nome,
    empresa: c.empresa,
    tipo: c.contratoUrl ? ("assinou_sem_pagar" as const) : ("pagou_sem_contrato" as const),
  }));

  const nichoData = clientesPorNicho
    .filter((n) => n.nicho)
    .map((n) => ({ nicho: n.nicho as string, total: n._count._all }))
    .sort((a, b) => b.total - a.total);

  const contagemPorEtapa = Object.fromEntries(
    leadsPorEtapaRaw.map((l) => [l.etapa, l._count._all]),
  ) as Record<(typeof ETAPA_LEAD_ORDEM)[number], number>;

  const funilLeads = ETAPA_LEAD_ORDEM.filter((etapa) => etapa !== "PERDIDO").map((etapa) => ({
    etapa,
    label: ETAPA_LEAD_CONFIG[etapa].label,
    total: contagemPorEtapa[etapa] ?? 0,
  }));

  const totalLeadsTodos = Object.values(contagemPorEtapa).reduce((acc, n) => acc + n, 0);
  const leadsPerdidos = contagemPorEtapa.PERDIDO ?? 0;
  const leadsFechados = contagemPorEtapa.FECHADO ?? 0;
  const baseConversao = totalLeadsTodos - leadsPerdidos;
  const taxaConversaoFunil = baseConversao > 0 ? (leadsFechados / baseConversao) * 100 : null;

  const receitaDoMes = pagamentosDoMes._sum.valor ?? 0;
  const receitaMesAnterior = pagamentosDoMesAnterior._sum.valor ?? 0;
  const variacaoReceitaMes = receitaMesAnterior > 0
    ? ((receitaDoMes - receitaMesAnterior) / receitaMesAnterior) * 100
    : null;

  return {
    stats: {
      leadsAtivos,
      clientesAtivos,
      projetosEmAndamento,
      projetosConcluidos,
      receitaDoMes,
      receitaMesAnterior,
      variacaoReceitaMes,
      metaFaturamentoMensal: configuracao?.metaFaturamentoMensal ?? null,
      pendencias: pagamentosPendentes._sum.valor ?? 0,
      pendenciasBadge: pendenciasContratoPagamento.length + pagamentosSemMatch.length,
      taxaConversaoFunil,
    },
    vendasPorMes,
    receitaPorMes,
    crescimento,
    nichoData,
    funilLeads,
    clientesRecentes,
    atividadesRecentes,
    clientesComPrazo,
    pendenciasContratoPagamento,
    pagamentosSemMatch,
    clientesParaVincular,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

// Consulta enxuta (sem os 15 fan-outs do dashboard inteiro) só pra mostrar o
// badge de pendências na sidebar, que aparece em toda página do CRM.
export async function getPendenciasBadgeCount() {
  const [clientesPendencia, pagamentosSemMatch] = await Promise.all([
    prisma.cliente.count({
      where: {
        status: { not: "FINALIZADO" },
        deletedAt: null,
        OR: [
          { contratoUrl: null, pagamentos: { some: { pago: true } } },
          { contratoUrl: { not: null }, pagamentos: { none: { pago: true } } },
        ],
      },
    }),
    prisma.pagamentoSemMatch.count({ where: { resolvido: false } }),
  ]);
  return clientesPendencia + pagamentosSemMatch;
}
