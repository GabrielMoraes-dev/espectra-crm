import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro, respostaDeErro } from "@/lib/automacoes/resposta";
import {
  parseLimite,
  parseData,
  parseBooleano,
  parseEnumOpcional,
  parseInteiroOpcional,
  parseIdentificadorOpcional,
  ParametroInvalidoError,
} from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";
import { diasEntre } from "@/lib/automacoes/dias";
import { linkListaLeads } from "@/lib/automacoes/links";
import { ETAPA_LEAD_ORDEM } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

// Lead não tem campo de responsável no schema (só Cliente/Projeto/Tarefa têm
// responsavelId) — por isso não existe filtro/campo "responsavel" aqui, ao
// contrário dos outros endpoints.
export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "leads";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  try {
    const limite = parseLimite(sp.get("limite"));
    const etapa = parseEnumOpcional(sp.get("etapa"), ETAPA_LEAD_ORDEM, "etapa");
    const origem = sp.get("origem") || undefined;
    const desde = parseData(sp.get("desde"), "desde");
    const fechado = parseBooleano(sp.get("fechado"), "fechado");
    const perdido = parseBooleano(sp.get("perdido"), "perdido");
    const semInteracao = parseBooleano(sp.get("semInteracao"), "semInteracao");
    const diasNaEtapaMin = parseInteiroOpcional(sp.get("diasNaEtapaMin"), "diasNaEtapaMin");
    const diasSemInteracaoMin = parseInteiroOpcional(sp.get("diasSemInteracaoMin"), "diasSemInteracaoMin");

    if (fechado && perdido) {
      throw new ParametroInvalidoError("'fechado' e 'perdido' são contraditórios — um lead não pode ser os dois.");
    }
    if (etapa && fechado && etapa !== "FECHADO") {
      throw new ParametroInvalidoError("'etapa' diferente de FECHADO junto com 'fechado=true' é contraditório.");
    }
    if (etapa && perdido && etapa !== "PERDIDO") {
      throw new ParametroInvalidoError("'etapa' diferente de PERDIDO junto com 'perdido=true' é contraditório.");
    }

    const where: Prisma.LeadWhereInput = {};
    if (etapa) where.etapa = etapa;
    if (fechado) where.etapa = "FECHADO";
    if (perdido) where.etapa = "PERDIDO";
    if (origem) where.origem = origem;
    if (desde) where.createdAt = { gte: desde };
    if (semInteracao) where.ultimaInteracaoEm = null;
    if (diasNaEtapaMin != null) {
      where.etapaAlteradaEm = { lte: new Date(Date.now() - diasNaEtapaMin * 86_400_000) };
    }
    if (diasSemInteracaoMin != null) {
      // Lead nunca contatado (ultimaInteracaoEm null) também satisfaz "N+ dias
      // sem interação" — na prática está sem contato há mais tempo ainda que
      // o limite pedido.
      const corte = new Date(Date.now() - diasSemInteracaoMin * 86_400_000);
      where.OR = [{ ultimaInteracaoEm: { lte: corte } }, { ultimaInteracaoEm: null }];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          nome: true,
          etapa: true,
          origem: true,
          valorEstimado: true,
          createdAt: true,
          etapaAlteradaEm: true,
          ultimaInteracaoEm: true,
          ultimaInteracaoTipo: true,
          clienteId: true,
        },
        // Mais parado primeiro — ordem mais útil pro caso de uso principal
        // (follow-up/leads parados), não a mesma ordem "mais recente" da UI.
        orderBy: { etapaAlteradaEm: "asc" },
        take: limite,
      }),
      prisma.lead.count({ where }),
    ]);

    const agora = new Date();
    const dados = leads.map((lead) => ({
      id: lead.id,
      nome: lead.nome,
      etapa: lead.etapa,
      origem: lead.origem,
      valorEstimado: lead.valorEstimado,
      createdAt: lead.createdAt.toISOString(),
      etapaAlteradaEm: lead.etapaAlteradaEm.toISOString(),
      diasNaEtapa: diasEntre(lead.etapaAlteradaEm, agora),
      ultimaInteracaoEm: lead.ultimaInteracaoEm?.toISOString() ?? null,
      ultimaInteracaoTipo: lead.ultimaInteracaoTipo,
      diasSemInteracao: lead.ultimaInteracaoEm ? diasEntre(lead.ultimaInteracaoEm, agora) : null,
      convertidoEmCliente: lead.clienteId !== null,
      links: { lista: linkListaLeads() },
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
        etapa: etapa ?? null,
        origem: origem ?? null,
        desde: desde?.toISOString() ?? null,
        fechado: fechado ?? null,
        perdido: perdido ?? null,
        semInteracao: semInteracao ?? null,
        diasNaEtapaMin: diasNaEtapaMin ?? null,
        diasSemInteracaoMin: diasSemInteracaoMin ?? null,
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
