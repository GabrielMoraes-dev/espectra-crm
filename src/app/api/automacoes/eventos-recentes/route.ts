import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro, respostaDeErro } from "@/lib/automacoes/resposta";
import {
  parseLimite,
  parseData,
  parseIdentificadorOpcional,
  validarIntervalo,
  ParametroInvalidoError,
} from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";
import { normalizarEvento } from "@/lib/automacoes/eventos";
import type { Prisma } from "@/generated/prisma/client";

// Fonte única: ActivityLog. TimelineEvent guarda os mesmos marcos comerciais
// (por cliente, sem tipo estruturado) e uniria as duas fontes sem ganho real de
// informação hoje — ver documentação da API pra detalhe dessa decisão.
//
// "responsavel" NÃO é filtro aqui: ActivityLog não guarda quem executou a ação
// (login único compartilhado, sem Usuario vinculado a cada entrada).
//
// "quais tarefas venceram"/"quais clientes tiveram X no status atual" não são
// respondidas por eventos (estados, não eventos logados) — usar os filtros de
// estado dos endpoints /tarefas, /clientes, /projetos pra isso.
export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "eventos-recentes";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints (gravar tentativa não autenticada seria uma escrita
  // ilimitada disponível pra qualquer pessoa, sem precisar do segredo).
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const desde = parseData(sp.get("desde"), "desde");
    const ate = parseData(sp.get("ate"), "ate");
    validarIntervalo(desde, ate, "desde", "ate");
    const tipo = sp.get("tipo") || undefined;
    const entidade = sp.get("entidade") || undefined;

    if (tipo === "automacao_consulta") {
      throw new ParametroInvalidoError("Parâmetro 'tipo' não pode ser 'automacao_consulta'.");
    }

    // A exclusão de auditoria vive na chave NOT (nunca em `tipo`) justamente
    // pra sobreviver a `if (tipo) where.tipo = tipo` abaixo — se estivesse em
    // `where.tipo`, um `?tipo=automacao_consulta` sobrescreveria a exclusão.
    // Com `NOT` separado, a query vira "tipo = automacao_consulta E tipo !=
    // automacao_consulta", que nunca bate com nenhuma linha.
    const where: Prisma.ActivityLogWhereInput = {
      NOT: { tipo: "automacao_consulta" },
    };
    if (tipo) where.tipo = tipo;
    if (entidade) where.entidadeTipo = entidade;
    if (desde || ate) {
      where.createdAt = {};
      if (desde) where.createdAt.gte = desde;
      if (ate) where.createdAt.lt = ate;
    }

    const [eventos, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: { id: true, tipo: true, entidadeTipo: true, entidadeId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limite,
      }),
      prisma.activityLog.count({ where }),
    ]);

    const dados = eventos.map((e) => {
      const { categoria, resumo } = normalizarEvento(e.tipo);
      return {
        id: e.id,
        tipo: e.tipo,
        categoria,
        resumo,
        entidadeTipo: e.entidadeTipo,
        entidadeId: e.entidadeId,
        ocorridoEm: e.createdAt.toISOString(),
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
        desde: desde?.toISOString() ?? null,
        ate: ate?.toISOString() ?? null,
        tipo: tipo ?? null,
        entidade: entidade ?? null,
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
