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
import { linkListaTarefas, linkCliente } from "@/lib/automacoes/links";
import { STATUS_TAREFA_ORDEM } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

const PRIORIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA"] as const;

export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "tarefas";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const status = parseEnumOpcional(sp.get("status"), STATUS_TAREFA_ORDEM, "status");
    const prioridade = parseEnumOpcional(sp.get("prioridade"), PRIORIDADES_VALIDAS, "prioridade");
    const responsavel = sp.get("responsavel") || undefined;
    const clienteId = sp.get("clienteId") || undefined;
    const desde = parseData(sp.get("desde"), "desde");
    const somenteAtrasadas = parseBooleano(sp.get("somenteAtrasadas"), "somenteAtrasadas");
    const prazoAte = parseData(sp.get("prazoAte"), "prazoAte");

    if (somenteAtrasadas && status === "CONCLUIDA") {
      throw new ParametroInvalidoError("'somenteAtrasadas' e 'status=CONCLUIDA' são contraditórios (tarefa concluída nunca é 'atrasada').");
    }

    // Tarefa.clienteId é OPCIONAL — uma tarefa sem cliente vinculado deve
    // continuar aparecendo (OR clienteId null), mas uma tarefa vinculada a um
    // cliente na LIXEIRA não deve (mesma regra de soft-delete dos outros
    // endpoints, aplicada só quando existe de fato uma relação com Cliente).
    const where: Prisma.TarefaWhereInput = {
      OR: [{ clienteId: null }, { cliente: { deletedAt: null } }],
    };
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (responsavel) where.responsavelId = responsavel;
    if (clienteId) where.clienteId = clienteId;
    if (desde) where.createdAt = { gte: desde };
    if (prazoAte) where.prazo = { lte: prazoAte };
    if (somenteAtrasadas) {
      where.prazo = { ...(where.prazo as object), lt: new Date() };
      where.status = { not: "CONCLUIDA" };
    }

    const [tarefas, total] = await Promise.all([
      prisma.tarefa.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          status: true,
          prioridade: true,
          prazo: true,
          createdAt: true,
          updatedAt: true,
          clienteId: true,
          responsavel: { select: { id: true, nome: true } },
          cliente: { select: { id: true, nome: true } },
        },
        orderBy: [{ prazo: "asc" }, { createdAt: "desc" }],
        take: limite,
      }),
      prisma.tarefa.count({ where }),
    ]);

    const agora = new Date();
    const dados = tarefas.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      status: t.status,
      prioridade: t.prioridade,
      prazo: t.prazo?.toISOString() ?? null,
      diasAtePrazo: t.prazo ? diasEntre(agora, t.prazo) : null,
      responsavel: t.responsavel ? { id: t.responsavel.id, nome: t.responsavel.nome } : null,
      cliente: t.cliente ? { id: t.cliente.id, nome: t.cliente.nome } : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      links: t.clienteId ? { clienteRelacionado: linkCliente(t.clienteId) } : { lista: linkListaTarefas() },
    }));

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
        prioridade: prioridade ?? null,
        responsavel: responsavel ?? null,
        clienteId: clienteId ?? null,
        desde: desde?.toISOString() ?? null,
        somenteAtrasadas: somenteAtrasadas ?? null,
        prazoAte: prazoAte?.toISOString() ?? null,
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
