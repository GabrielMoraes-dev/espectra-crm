import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro, respostaDeErro } from "@/lib/automacoes/resposta";
import { parseData, parseIdentificadorOpcional, validarIntervalo } from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";
import { diasEntre } from "@/lib/automacoes/dias";
import type { Prisma } from "@/generated/prisma/client";

const TRINTA_DIAS_MS = 30 * 86_400_000;

// Métricas agregadas, pensadas pra reduzir tokens/consultas de quem consome —
// SEM reaproveitar getDashboardData()/getFinanceiroData() (que trazem listas de
// exibição e campos que essa API não deve expor). Duas famílias de números:
// "NoPeriodo" (escopadas por inicio/fim — o que aconteceu na janela) e "Atual"
// (estado agora, não faz sentido escopar por período — ex: clientes ativos).
export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "metricas";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const responsavel = sp.get("responsavel") || undefined;
    const nicho = sp.get("nicho") || undefined;
    const fimPeriodo = parseData(sp.get("fim"), "fim") ?? new Date();
    const inicioPeriodo = parseData(sp.get("inicio"), "inicio") ?? new Date(fimPeriodo.getTime() - TRINTA_DIAS_MS);
    validarIntervalo(inicioPeriodo, fimPeriodo, "inicio", "fim");

    // Lead não tem responsavelId nem nicho no schema — esses dois filtros não
    // se aplicam aos números de leads abaixo (documentado também na resposta).
    //
    // Todos os filtros abaixo também excluem clientes na lixeira
    // (cliente.deletedAt: null) — mesma regra de soft-delete de /clientes,
    // agora propagada pras entidades relacionadas (Pagamento/Projeto/Tarefa
    // sempre pertencem a um Cliente). Tarefa é a exceção: seu clienteId é
    // OPCIONAL, então uma tarefa sem cliente vinculado continua contando
    // normalmente (OR clienteId null).
    const clienteComResponsavelNicho: Prisma.ClienteWhereInput = {
      deletedAt: null,
      ...(responsavel ? { responsavelId: responsavel } : {}),
      ...(nicho ? { nicho } : {}),
    };
    const pagamentoClienteFiltro: Prisma.PagamentoWhereInput = {
      cliente: {
        deletedAt: null,
        ...(responsavel ? { responsavelId: responsavel } : {}),
        ...(nicho ? { nicho } : {}),
      },
    };
    const projetoClienteFiltro: Prisma.ProjetoWhereInput = {
      cliente: { deletedAt: null, ...(nicho ? { nicho } : {}) },
      ...(responsavel ? { responsavelId: responsavel } : {}),
    };
    const tarefaClienteFiltro: Prisma.TarefaWhereInput = {
      OR: [{ clienteId: null }, { cliente: { deletedAt: null } }],
      ...(responsavel ? { responsavelId: responsavel } : {}),
      ...(nicho ? { cliente: { nicho } } : {}),
    };

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioProximoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

    const [
      novosNoPeriodo,
      leadsPorOrigemRaw,
      conversoesNoPeriodo,
      perdasNoPeriodo,
      leadsSemInteracaoAtual,
      leadsAtivosParaTempo,
      clientesAtivosAtual,
      clientesFinalizadosAtual,
      projetosPorEtapaRaw,
      projetosAtrasadosAtual,
      tarefasPendentesAtual,
      tarefasAtrasadasAtual,
      recebidoNoPeriodoAgg,
      pendenteAtualAgg,
      ticketMedioNoPeriodoAgg,
      receitaMesAtualAgg,
      receitaMesAnteriorAgg,
      configuracao,
      satisfacaoNoPeriodoAgg,
    ] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: inicioPeriodo, lt: fimPeriodo } } }),
      prisma.lead.groupBy({
        by: ["origem"],
        where: { createdAt: { gte: inicioPeriodo, lt: fimPeriodo } },
        _count: { _all: true },
      }),
      prisma.lead.count({ where: { etapa: "FECHADO", etapaAlteradaEm: { gte: inicioPeriodo, lt: fimPeriodo } } }),
      prisma.lead.count({ where: { etapa: "PERDIDO", etapaAlteradaEm: { gte: inicioPeriodo, lt: fimPeriodo } } }),
      prisma.lead.count({ where: { ultimaInteracaoEm: null, etapa: { notIn: ["FECHADO", "PERDIDO"] } } }),
      prisma.lead.findMany({
        where: { etapa: { notIn: ["FECHADO", "PERDIDO"] } },
        select: { etapa: true, etapaAlteradaEm: true },
      }),
      prisma.cliente.count({ where: { ...clienteComResponsavelNicho, status: { not: "FINALIZADO" } } }),
      prisma.cliente.count({ where: { ...clienteComResponsavelNicho, status: "FINALIZADO" } }),
      prisma.projeto.groupBy({ by: ["status"], where: projetoClienteFiltro, _count: { _all: true } }),
      prisma.projeto.count({ where: { ...projetoClienteFiltro, status: { not: "PUBLICADO" }, prazo: { lt: agora } } }),
      prisma.tarefa.count({ where: { ...tarefaClienteFiltro, status: { not: "CONCLUIDA" } } }),
      prisma.tarefa.count({
        where: { ...tarefaClienteFiltro, status: { not: "CONCLUIDA" }, prazo: { lt: agora } },
      }),
      prisma.pagamento.aggregate({
        where: { ...pagamentoClienteFiltro, pago: true, data: { gte: inicioPeriodo, lt: fimPeriodo } },
        _sum: { valor: true },
      }),
      prisma.pagamento.aggregate({ where: { ...pagamentoClienteFiltro, pago: false }, _sum: { valor: true } }),
      prisma.pagamento.aggregate({
        where: { ...pagamentoClienteFiltro, pago: true, data: { gte: inicioPeriodo, lt: fimPeriodo } },
        _avg: { valor: true },
      }),
      prisma.pagamento.aggregate({
        where: { ...pagamentoClienteFiltro, pago: true, data: { gte: inicioMesAtual, lt: inicioProximoMes } },
        _sum: { valor: true },
      }),
      prisma.pagamento.aggregate({
        where: { ...pagamentoClienteFiltro, pago: true, data: { gte: inicioMesAnterior, lt: inicioMesAtual } },
        _sum: { valor: true },
      }),
      prisma.configuracaoEmpresa.findFirst({ select: { metaFaturamentoMensal: true } }),
      prisma.pesquisaSatisfacao.aggregate({
        where: {
          cliente: { deletedAt: null, ...(responsavel ? { responsavelId: responsavel } : {}), ...(nicho ? { nicho } : {}) },
          createdAt: { gte: inicioPeriodo, lt: fimPeriodo },
        },
        _avg: { nota: true },
        _count: { _all: true },
      }),
    ]);

    const leadsPorOrigemNoPeriodo = Object.fromEntries(
      leadsPorOrigemRaw.map((l) => [l.origem ?? "sem_origem", l._count._all]),
    );

    const somaPorEtapa: Record<string, { soma: number; qtd: number }> = {};
    for (const l of leadsAtivosParaTempo) {
      const dias = diasEntre(l.etapaAlteradaEm, agora);
      somaPorEtapa[l.etapa] ??= { soma: 0, qtd: 0 };
      somaPorEtapa[l.etapa].soma += dias;
      somaPorEtapa[l.etapa].qtd += 1;
    }
    const tempoMedioNaEtapaAtualDias = Object.fromEntries(
      Object.entries(somaPorEtapa).map(([etapa, { soma, qtd }]) => [etapa, Math.round((soma / qtd) * 10) / 10]),
    );

    const taxaConversaoNoPeriodo =
      conversoesNoPeriodo + perdasNoPeriodo > 0 ? conversoesNoPeriodo / (conversoesNoPeriodo + perdasNoPeriodo) : null;

    const projetosPorEtapaAtual = Object.fromEntries(projetosPorEtapaRaw.map((p) => [p.status, p._count._all]));

    const receitaMesAtual = receitaMesAtualAgg._sum.valor ?? 0;
    const receitaMesAnterior = receitaMesAnteriorAgg._sum.valor ?? 0;
    const metaFaturamentoMensal = configuracao?.metaFaturamentoMensal ?? null;

    await registrarAuditoria({ endpoint, consumidor, rotina, sucesso: true, duracaoMs: Date.now() - inicio });

    return respostaSucesso(
      {
        leads: {
          novosNoPeriodo,
          porOrigemNoPeriodo: leadsPorOrigemNoPeriodo,
          conversoesNoPeriodo,
          perdasNoPeriodo,
          taxaConversaoNoPeriodo,
          semInteracaoAtual: leadsSemInteracaoAtual,
          tempoMedioNaEtapaAtualDias,
          observacao:
            "responsavel/nicho não filtram estes números — Lead não tem esses campos no schema atual. " +
            "tempoMedioNaEtapaAtualDias reflete leads HOJE em cada etapa (não é histórico de trânsito por etapa, que não existe estruturalmente).",
        },
        clientes: { ativosAtual: clientesAtivosAtual, finalizadosAtual: clientesFinalizadosAtual },
        projetos: { porEtapaAtual: projetosPorEtapaAtual, atrasadosAtual: projetosAtrasadosAtual },
        tarefas: { pendentesAtual: tarefasPendentesAtual, atrasadasAtual: tarefasAtrasadasAtual },
        financeiro: {
          recebidoNoPeriodo: recebidoNoPeriodoAgg._sum.valor ?? 0,
          pendenteAtual: pendenteAtualAgg._sum.valor ?? 0,
          ticketMedioNoPeriodo: ticketMedioNoPeriodoAgg._avg.valor ?? 0,
          moeda: "BRL",
        },
        metaMensal: {
          meta: metaFaturamentoMensal,
          receitaMesAtual,
          percentualAtingido:
            metaFaturamentoMensal && metaFaturamentoMensal > 0 ? (receitaMesAtual / metaFaturamentoMensal) * 100 : null,
        },
        comparativoMensal: {
          receitaMesAtual,
          receitaMesAnterior,
          variacaoPercentual: receitaMesAnterior > 0 ? ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100 : null,
        },
        satisfacao: {
          notaMediaNoPeriodo: satisfacaoNoPeriodoAgg._avg.nota,
          totalRespostasNoPeriodo: satisfacaoNoPeriodoAgg._count._all,
        },
      },
      {
        filtros: {
          inicio: inicioPeriodo.toISOString(),
          fim: fimPeriodo.toISOString(),
          responsavel: responsavel ?? null,
          nicho: nicho ?? null,
          periodoPadraoAplicado: !sp.get("inicio") && !sp.get("fim"),
        },
      },
    );
  } catch (erro) {
    await registrarAuditoria({ endpoint, consumidor, rotina, sucesso: false, duracaoMs: Date.now() - inicio });
    return respostaDeErro(erro);
  }
}
