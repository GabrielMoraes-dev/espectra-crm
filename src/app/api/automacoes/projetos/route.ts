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
import { diasEntre } from "@/lib/automacoes/dias";
import { linkListaProjetos, linkCliente } from "@/lib/automacoes/links";
import { ETAPA_PROJETO_ORDEM, CHECKLIST_ETAPA_PROJETO } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

function contarChecklist(status: (typeof ETAPA_PROJETO_ORDEM)[number], checklistConcluidoJson: string) {
  const totalItens = CHECKLIST_ETAPA_PROJETO[status]?.length ?? 0;
  try {
    const concluidos: unknown = JSON.parse(checklistConcluidoJson || "[]");
    const qtdConcluidos = Array.isArray(concluidos) ? concluidos.length : 0;
    return { concluidos: Math.min(qtdConcluidos, totalItens), total: totalItens };
  } catch {
    // JSON inválido não deve derrubar o endpoint — degrada pra "0 de N".
    return { concluidos: 0, total: totalItens };
  }
}

export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "projetos";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const status = parseEnumOpcional(sp.get("status"), ETAPA_PROJETO_ORDEM, "status");
    const etapa = parseEnumOpcional(sp.get("etapa"), ETAPA_PROJETO_ORDEM, "etapa");
    const responsavel = sp.get("responsavel") || undefined;
    const desde = parseData(sp.get("desde"), "desde");
    const somenteAtrasados = parseBooleano(sp.get("somenteAtrasados"), "somenteAtrasados");
    const prazoAte = parseData(sp.get("prazoAte"), "prazoAte");
    const clienteId = sp.get("clienteId") || undefined;

    // "status" e "etapa" são sinônimos (EtapaProjeto é o único campo de estágio
    // do Projeto) — aceita os dois nomes, mas rejeita se vierem com valores
    // diferentes (senão um simplesmente vence silenciosamente e o filtro que
    // o consumidor pensa ter aplicado não é o que realmente rodou).
    if (status && etapa && status !== etapa) {
      throw new ParametroInvalidoError("'status' e 'etapa' são o mesmo filtro — informe apenas um, ou valores iguais.");
    }
    const etapaFiltro = status ?? etapa;

    // cliente.deletedAt: null — Projeto sempre tem clienteId obrigatório, então
    // um projeto de um cliente na lixeira nunca deveria aparecer aqui.
    const where: Prisma.ProjetoWhereInput = { cliente: { deletedAt: null } };
    if (etapaFiltro) where.status = etapaFiltro;
    if (responsavel) where.responsavelId = responsavel;
    if (desde) where.createdAt = { gte: desde };
    if (prazoAte) where.prazo = { lte: prazoAte };
    if (clienteId) where.clienteId = clienteId;
    if (somenteAtrasados) {
      if (etapaFiltro === "PUBLICADO") {
        throw new ParametroInvalidoError("'somenteAtrasados' e 'status=PUBLICADO' são contraditórios (projeto publicado nunca é 'atrasado').");
      }
      where.prazo = { ...(where.prazo as object), lt: new Date() };
      where.status = { not: "PUBLICADO" };
    }

    const [projetos, total] = await Promise.all([
      prisma.projeto.findMany({
        where,
        select: {
          id: true,
          status: true,
          prazo: true,
          checklistConcluido: true,
          updatedAt: true,
          clienteId: true,
          cliente: { select: { id: true, nome: true } },
          responsavel: { select: { id: true, nome: true } },
        },
        orderBy: [{ prazo: "asc" }, { createdAt: "desc" }],
        take: limite,
      }),
      prisma.projeto.count({ where }),
    ]);

    // Tarefa não tem relação direta com Projeto no schema (só com Cliente) —
    // então "tarefas pendentes/atrasadas" aqui reflete as tarefas do CLIENTE
    // do projeto, não tarefas exclusivas dessa entrega específica. Documentado
    // também na resposta via o campo `tarefasEscopo`.
    const clienteIds = [...new Set(projetos.map((p) => p.clienteId))];
    const tarefasPorCliente = clienteIds.length
      ? await prisma.tarefa.groupBy({
          by: ["clienteId", "status"],
          where: { clienteId: { in: clienteIds } },
          _count: { _all: true },
        })
      : [];
    const agora = new Date();
    const tarefasAtrasadasPorCliente = clienteIds.length
      ? await prisma.tarefa.groupBy({
          by: ["clienteId"],
          where: { clienteId: { in: clienteIds }, status: { not: "CONCLUIDA" }, prazo: { lt: agora } },
          _count: { _all: true },
        })
      : [];

    const dados = projetos.map((p) => {
      const pendentes = tarefasPorCliente
        .filter((t) => t.clienteId === p.clienteId && t.status !== "CONCLUIDA")
        .reduce((soma, t) => soma + t._count._all, 0);
      const atrasadas = tarefasAtrasadasPorCliente.find((t) => t.clienteId === p.clienteId)?._count._all ?? 0;

      return {
        id: p.id,
        cliente: p.cliente,
        status: p.status,
        prazo: p.prazo?.toISOString() ?? null,
        diasAtePrazo: p.prazo ? diasEntre(agora, p.prazo) : null,
        responsavel: p.responsavel ? { id: p.responsavel.id, nome: p.responsavel.nome } : null,
        checklist: contarChecklist(p.status, p.checklistConcluido),
        tarefasEscopo: "cliente" as const,
        tarefasPendentes: pendentes,
        tarefasAtrasadas: atrasadas,
        updatedAt: p.updatedAt.toISOString(),
        links: { clienteRelacionado: linkCliente(p.clienteId), lista: linkListaProjetos() },
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
        status: etapaFiltro ?? null,
        responsavel: responsavel ?? null,
        desde: desde?.toISOString() ?? null,
        somenteAtrasados: somenteAtrasados ?? null,
        prazoAte: prazoAte?.toISOString() ?? null,
        clienteId: clienteId ?? null,
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
