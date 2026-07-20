import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro, respostaDeErro } from "@/lib/automacoes/resposta";
import {
  parseLimite,
  parseData,
  parseBooleano,
  parseEnumOpcional,
  parseIdentificadorOpcional,
  ParametroInvalidoError,
} from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";
import { linkCliente } from "@/lib/automacoes/links";
import { STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

const STATUS_VALIDOS = Object.keys(STATUS_CLIENTE_CONFIG) as (keyof typeof STATUS_CLIENTE_CONFIG)[];

export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "clientes";

  // Auditoria só começa DEPOIS da autenticação válida — gravar tentativa não
  // autenticada permitiria qualquer pessoa (sem conhecer o segredo) inflar o
  // ActivityLog indefinidamente, já que essa rota é pública no proxy e não tem
  // rate limit.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const status = parseEnumOpcional(sp.get("status"), STATUS_VALIDOS, "status");
    const responsavel = sp.get("responsavel") || undefined;
    const desde = parseData(sp.get("desde"), "desde");
    const prazoAte = parseData(sp.get("prazoAte"), "prazoAte");
    const somenteFinalizados = parseBooleano(sp.get("somenteFinalizados"), "somenteFinalizados");
    const somenteAtivos = parseBooleano(sp.get("somenteAtivos"), "somenteAtivos");
    const pagamentoPendente = parseBooleano(sp.get("pagamentoPendente"), "pagamentoPendente");
    const pesquisaPendente = parseBooleano(sp.get("pesquisaPendente"), "pesquisaPendente");

    // Combinações contraditórias são rejeitadas com 400 em vez de deixar a
    // última atribuição "vencer" silenciosamente — pra um agente, um filtro
    // que ele acha que aplicou mas que foi sobrescrito por outro produz um
    // resultado semanticamente errado sem nenhum aviso.
    if (somenteFinalizados && somenteAtivos) {
      throw new ParametroInvalidoError("'somenteFinalizados' e 'somenteAtivos' são contraditórios — use apenas um.");
    }
    if (status && somenteFinalizados && status !== "FINALIZADO") {
      throw new ParametroInvalidoError("'status' diferente de FINALIZADO junto com 'somenteFinalizados' é contraditório.");
    }
    if (status && somenteAtivos && status === "FINALIZADO") {
      throw new ParametroInvalidoError("'status=FINALIZADO' junto com 'somenteAtivos' é contraditório.");
    }
    if (pesquisaPendente && somenteAtivos) {
      throw new ParametroInvalidoError("'pesquisaPendente' (implica status FINALIZADO) e 'somenteAtivos' são contraditórios.");
    }
    if (pesquisaPendente && status && status !== "FINALIZADO") {
      throw new ParametroInvalidoError("'pesquisaPendente' implica status=FINALIZADO — incompatível com o 'status' informado.");
    }

    // deletedAt: null é obrigatório, não configurável — clientes na lixeira
    // nunca aparecem aqui, mesmo padrão de soft-delete usado no resto do CRM.
    const where: Prisma.ClienteWhereInput = { deletedAt: null };
    if (status) where.status = status;
    if (somenteFinalizados) where.status = "FINALIZADO";
    if (somenteAtivos) where.status = { not: "FINALIZADO" };
    if (pesquisaPendente) {
      where.status = "FINALIZADO";
      where.pesquisas = { none: {} };
    }
    if (responsavel) where.responsavelId = responsavel;
    if (desde) where.dataEntrada = { gte: desde };
    if (prazoAte) where.prazo = { lte: prazoAte };
    if (pagamentoPendente) where.pagamentos = { some: { pago: false } };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        select: {
          id: true,
          nome: true,
          status: true,
          nicho: true,
          cidade: true,
          estado: true,
          dataEntrada: true,
          prazo: true,
          valor: true,
          contratoUrl: true,
          responsavel: { select: { id: true, nome: true } },
          projetos: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 },
          pagamentos: { select: { valor: true, pago: true } },
          pesquisas: { select: { nota: true }, orderBy: { createdAt: "desc" }, take: 1 },
          timeline: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { briefings: true } },
        },
        orderBy: { dataEntrada: "desc" },
        take: limite,
      }),
      prisma.cliente.count({ where }),
    ]);

    const dados = clientes.map((c) => {
      const totalPago = c.pagamentos.filter((p) => p.pago).reduce((soma, p) => soma + p.valor, 0);
      const totalPendente = c.pagamentos.filter((p) => !p.pago).reduce((soma, p) => soma + p.valor, 0);
      const situacaoPagamento = totalPendente > 0 ? "pendente" : totalPago > 0 ? "em_dia" : "sem_pagamento";

      return {
        id: c.id,
        nome: c.nome,
        status: c.status,
        nicho: c.nicho,
        cidade: c.cidade,
        estado: c.estado,
        dataEntrada: c.dataEntrada.toISOString(),
        prazo: c.prazo?.toISOString() ?? null,
        responsavel: c.responsavel ? { id: c.responsavel.id, nome: c.responsavel.nome } : null,
        valorContratado: c.valor,
        pagamento: { situacao: situacaoPagamento, totalPago, totalPendente },
        contratoAssinado: c.contratoUrl !== null,
        briefingRecebido: c._count.briefings > 0,
        situacaoProjeto: c.projetos[0]?.status ?? null,
        notaSatisfacao: c.pesquisas[0]?.nota ?? null,
        ultimaAtividadeEm: c.timeline[0]?.createdAt.toISOString() ?? null,
        links: { registro: linkCliente(c.id) },
      };
    });

    await registrarAuditoria({
      endpoint,
      consumidor,
      rotina,
      sucesso: true,
      totalRegistros: dados.length,
      duracaoMs: Date.now() - inicio,
    });

    return respostaSucesso(dados, {
      filtros: {
        status: status ?? null,
        responsavel: responsavel ?? null,
        desde: desde?.toISOString() ?? null,
        prazoAte: prazoAte?.toISOString() ?? null,
        somenteFinalizados: somenteFinalizados ?? null,
        somenteAtivos: somenteAtivos ?? null,
        pagamentoPendente: pagamentoPendente ?? null,
        pesquisaPendente: pesquisaPendente ?? null,
        limite,
      },
      total,
      retornado: dados.length,
      temMais: total > dados.length,
    });
  } catch (erro) {
    await registrarAuditoria({ endpoint, consumidor, rotina, sucesso: false, duracaoMs: Date.now() - inicio });
    return respostaDeErro(erro);
  }
}
