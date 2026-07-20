import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro, respostaDeErro } from "@/lib/automacoes/resposta";
import {
  parseLimite,
  parseData,
  parseBooleano,
  parseIdentificadorOpcional,
  validarIntervalo,
} from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";
import { linkCliente } from "@/lib/automacoes/links";
import type { Prisma } from "@/generated/prisma/client";

// `Pagamento.valor` já é o valor FINAL (com desconto aplicado) — é o que a
// Cakto/o cadastro manual registra como recebido/a receber. `valorBruto` abaixo
// é reconstruído a partir do desconto% (valor / (1 - desconto/100)), não é um
// dado gravado — pode ter uma pequena diferença de arredondamento.
function calcularValorBruto(valorFinal: number, desconto: number | null) {
  if (!desconto) return valorFinal;
  return Math.round((valorFinal / (1 - desconto / 100)) * 100) / 100;
}

export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "financeiro";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const inicioPeriodo = parseData(sp.get("inicio"), "inicio");
    const fimPeriodo = parseData(sp.get("fim"), "fim");
    validarIntervalo(inicioPeriodo, fimPeriodo, "inicio", "fim");
    const pago = parseBooleano(sp.get("pago"), "pago");
    const clienteId = sp.get("clienteId") || undefined;
    const formaPagamento = sp.get("formaPagamento") || undefined;
    const somenteSemMatch = parseBooleano(sp.get("somenteSemMatch"), "somenteSemMatch");

    // cliente.deletedAt: null — um cliente na lixeira não deve reaparecer aqui
    // (mesma regra de /clientes). Pagamento.clienteId é obrigatório, então essa
    // relação sempre existe.
    const where: Prisma.PagamentoWhereInput = { cliente: { deletedAt: null } };
    if (inicioPeriodo || fimPeriodo) {
      where.data = {};
      if (inicioPeriodo) where.data.gte = inicioPeriodo;
      if (fimPeriodo) where.data.lt = fimPeriodo;
    }
    if (pago != null) where.pago = pago;
    if (clienteId) where.clienteId = clienteId;
    if (formaPagamento) where.formaPagamento = formaPagamento;

    // PagamentoSemMatch não tem clienteId/formaPagamento/pago (é, por
    // definição, um pagamento sem cliente identificado) — só `inicio`/`fim`
    // (via createdAt) fazem sentido pra ele.
    const whereSemMatch: Prisma.PagamentoSemMatchWhereInput = { resolvido: false };
    if (inicioPeriodo || fimPeriodo) {
      whereSemMatch.createdAt = {};
      if (inicioPeriodo) whereSemMatch.createdAt.gte = inicioPeriodo;
      if (fimPeriodo) whereSemMatch.createdAt.lt = fimPeriodo;
    }

    const [pagamentos, totalPagamentos, totalPagoAgg, totalPendenteAgg, ticketMedioAgg, semMatch, totalSemMatch] =
      await Promise.all([
        somenteSemMatch
          ? Promise.resolve([])
          : prisma.pagamento.findMany({
              where,
              select: {
                id: true,
                valor: true,
                desconto: true,
                pago: true,
                formaPagamento: true,
                data: true,
                cliente: { select: { id: true, nome: true } },
              },
              orderBy: { data: "desc" },
              take: limite,
            }),
        somenteSemMatch ? Promise.resolve(null) : prisma.pagamento.count({ where }),
        prisma.pagamento.aggregate({ where: { ...where, pago: true }, _sum: { valor: true } }),
        prisma.pagamento.aggregate({ where: { ...where, pago: false }, _sum: { valor: true } }),
        prisma.pagamento.aggregate({ where: { ...where, pago: true }, _avg: { valor: true } }),
        prisma.pagamentoSemMatch.findMany({
          where: whereSemMatch,
          select: { id: true, nome: true, valor: true, createdAt: true, resolvido: true },
          orderBy: { createdAt: "desc" },
          take: limite,
        }),
        prisma.pagamentoSemMatch.count({ where: whereSemMatch }),
      ]);

    const dados = pagamentos.map((p) => ({
      id: p.id,
      cliente: p.cliente,
      valorBruto: calcularValorBruto(p.valor, p.desconto),
      desconto: p.desconto,
      valorFinal: p.valor,
      pago: p.pago,
      formaPagamento: p.formaPagamento,
      data: p.data.toISOString(),
      links: { clienteRelacionado: linkCliente(p.cliente.id) },
    }));

    const semMatchDados = semMatch.map((s) => ({
      id: s.id,
      nome: s.nome,
      valor: s.valor,
      createdAt: s.createdAt.toISOString(),
      resolvido: s.resolvido,
    }));

    await registrarAuditoria({
      endpoint,
      consumidor,
      rotina,
      sucesso: true,
      totalRegistros: dados.length + semMatchDados.length,
      duracaoMs: Date.now() - inicio,
    });

    // Paginação de `pagamentos` e `semMatch` são reportadas separadamente —
    // são duas listas independentes, com filtros parcialmente diferentes
    // (ver comentário acima), então um único total/temMais combinado seria
    // enganoso pra quem consome a resposta.
    return respostaSucesso(
      { pagamentos: dados, semMatch: semMatchDados },
      {
        filtros: {
          inicio: inicioPeriodo?.toISOString() ?? null,
          fim: fimPeriodo?.toISOString() ?? null,
          pago: pago ?? null,
          clienteId: clienteId ?? null,
          formaPagamento: formaPagamento ?? null,
          somenteSemMatch: somenteSemMatch ?? null,
          limite,
        },
        pagamentos:
          totalPagamentos === null
            ? null // não consultado nesta chamada (somenteSemMatch=true)
            : { total: totalPagamentos, retornado: dados.length, temMais: totalPagamentos > dados.length },
        semMatch: { total: totalSemMatch, retornado: semMatchDados.length, temMais: totalSemMatch > semMatchDados.length },
        totais: {
          totalPago: totalPagoAgg._sum.valor ?? 0,
          totalPendente: totalPendenteAgg._sum.valor ?? 0,
          ticketMedio: ticketMedioAgg._avg.valor ?? 0,
          moeda: "BRL",
        },
      },
    );
  } catch (erro) {
    await registrarAuditoria({ endpoint, consumidor, rotina, sucesso: false, duracaoMs: Date.now() - inicio });
    return respostaDeErro(erro);
  }
}
