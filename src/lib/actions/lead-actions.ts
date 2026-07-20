"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  leadSchema,
  convertLeadSchema,
  registrarInteracaoLeadSchema,
  type LeadFormValues,
  type ConvertLeadValues,
  type RegistrarInteracaoLeadValues,
} from "@/lib/validations";
import { ETAPA_LEAD_CONFIG, TIPO_INTERACAO_LEAD_CONFIG } from "@/lib/constants";
import { requireAuth } from "@/lib/auth/session";
import type { Lead } from "@/generated/prisma/client";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

// Erros esperados de conflito de concorrência voltam como valor de retorno, não
// como exceção lançada — em produção o Next pode substituir a mensagem de uma
// exceção por um texto genérico, o que quebraria uma checagem tipo
// `err.message === "CONFLITO_ETAPA"` no cliente.
export type AcaoLeadResult<T> = { ok: true; data: T } | { ok: false; erro: "CONFLITO_ETAPA" | "LEAD_JA_CONVERTIDO" };

export async function createLead(values: LeadFormValues) {
  await requireAuth();
  const data = leadSchema.parse(values);

  const lead = await prisma.lead.create({
    data: {
      nome: data.nome,
      empresa: clean(data.empresa),
      whatsapp: clean(data.whatsapp),
      instagram: clean(data.instagram),
      email: clean(data.email),
      origem: clean(data.origem),
      valorEstimado: data.valorEstimado ?? null,
      observacoes: clean(data.observacoes),
      etapa: data.etapa,
    },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "lead_criado",
      descricao: `Novo lead '${lead.nome}'${lead.empresa ? ` (${lead.empresa})` : ""} adicionado`,
      entidadeTipo: "lead",
      entidadeId: lead.id,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  return lead;
}

// `etapaAnterior` é a etapa que o formulário tinha no momento em que foi ABERTO
// (não uma releitura do servidor) — é isso que faz o compare-and-swap
// realmente proteger contra o cenário "usuário A abre o formulário, usuário B
// move o lead pelo Kanban, usuário A salva por cima com dado obsoleto": se a
// etapa no banco não bater mais com a que o formulário tinha, o updateMany
// afeta 0 linhas e a função retorna `{ ok: false, erro: "CONFLITO_ETAPA" }`
// em vez de sobrescrever silenciosamente a mudança concorrente.
export async function updateLead(
  id: string,
  etapaAnterior: LeadFormValues["etapa"],
  values: LeadFormValues,
): Promise<AcaoLeadResult<Lead>> {
  await requireAuth();
  const data = leadSchema.parse(values);
  const etapaMudou = etapaAnterior !== data.etapa;

  try {
    const lead = await prisma.$transaction(async (tx) => {
      const result = await tx.lead.updateMany({
        where: { id, etapa: etapaAnterior },
        data: {
          nome: data.nome,
          empresa: clean(data.empresa),
          whatsapp: clean(data.whatsapp),
          instagram: clean(data.instagram),
          email: clean(data.email),
          origem: clean(data.origem),
          valorEstimado: data.valorEstimado ?? null,
          observacoes: clean(data.observacoes),
          etapa: data.etapa,
          ...(etapaMudou ? { etapaAlteradaEm: new Date() } : {}),
        },
      });

      if (result.count === 0) {
        throw new Error("CONFLITO_ETAPA");
      }

      if (etapaMudou) {
        await tx.activityLog.create({
          data: {
            tipo: "lead_etapa",
            descricao: `Lead '${data.nome}' avançou para ${ETAPA_LEAD_CONFIG[data.etapa].label}`,
            entidadeTipo: "lead",
            entidadeId: id,
          },
        });
      }

      return tx.lead.findUniqueOrThrow({ where: { id } });
    });

    revalidatePath("/leads");
    revalidatePath("/");
    return { ok: true, data: lead };
  } catch (e) {
    if (e instanceof Error && e.message === "CONFLITO_ETAPA") {
      return { ok: false, erro: "CONFLITO_ETAPA" };
    }
    throw e;
  }
}

// Mesma lógica de compare-and-swap do updateLead, mas recebendo a etapa que o
// cliente já tinha em mãos antes do drag — evita que um drop otimista baseado
// em dado desatualizado sobrescreva uma mudança feita por outra pessoa/aba.
export async function moveLeadEtapa(
  id: string,
  etapaAnterior: LeadFormValues["etapa"],
  novaEtapa: LeadFormValues["etapa"],
): Promise<AcaoLeadResult<Lead>> {
  await requireAuth();

  if (etapaAnterior === novaEtapa) {
    return { ok: true, data: await prisma.lead.findUniqueOrThrow({ where: { id } }) };
  }

  try {
    const lead = await prisma.$transaction(async (tx) => {
      const result = await tx.lead.updateMany({
        where: { id, etapa: etapaAnterior },
        data: { etapa: novaEtapa, etapaAlteradaEm: new Date() },
      });

      if (result.count === 0) {
        throw new Error("CONFLITO_ETAPA");
      }

      const atualizado = await tx.lead.findUniqueOrThrow({ where: { id } });

      await tx.activityLog.create({
        data: {
          tipo: novaEtapa === "PERDIDO" ? "lead_perdido" : "lead_etapa",
          descricao:
            novaEtapa === "PERDIDO"
              ? `Lead '${atualizado.nome}' marcado como Perdido`
              : `Lead '${atualizado.nome}' avançou para ${ETAPA_LEAD_CONFIG[novaEtapa].label}`,
          entidadeTipo: "lead",
          entidadeId: id,
        },
      });

      return atualizado;
    });

    revalidatePath("/leads");
    revalidatePath("/");
    return { ok: true, data: lead };
  } catch (e) {
    if (e instanceof Error && e.message === "CONFLITO_ETAPA") {
      return { ok: false, erro: "CONFLITO_ETAPA" };
    }
    throw e;
  }
}

export async function deleteLead(id: string) {
  await requireAuth();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function registrarLinkCopiado(leadId: string) {
  await requireAuth();
  await prisma.lead.update({ where: { id: leadId }, data: { linkCopiadoEm: new Date() } });
}

// Único registro estruturado de contato comercial real com o lead (WhatsApp,
// ligação, reunião etc.) — atualiza ultimaInteracaoEm/ultimaInteracaoTipo (nunca
// tocados por outra ação) e deixa rastro auditável no ActivityLog, sem precisar
// de uma tabela dedicada de histórico.
export async function registrarInteracaoLead(leadId: string, values: RegistrarInteracaoLeadValues) {
  await requireAuth();
  const data = registrarInteracaoLeadSchema.parse(values);

  const lead = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.lead.update({
      where: { id: leadId },
      data: {
        ultimaInteracaoEm: new Date(),
        ultimaInteracaoTipo: data.tipo,
      },
    });

    await tx.activityLog.create({
      data: {
        tipo: "lead_interacao",
        descricao: `Interação registrada com '${atualizado.nome}': ${TIPO_INTERACAO_LEAD_CONFIG[data.tipo].label}${data.observacao ? ` — ${data.observacao}` : ""}`,
        entidadeTipo: "lead",
        entidadeId: leadId,
      },
    });

    return atualizado;
  });

  revalidatePath("/leads");
  revalidatePath("/");
  return lead;
}

// Toda a conversão (criar Cliente, timeline, fechar o Lead e logar) roda numa
// única transação: se qualquer passo falhar, nada fica gravado pela metade. O
// updateMany com clienteId: null funciona como trava contra conversão em
// duplicidade (ex: duplo clique) — se outro processo já converteu esse lead
// entre a leitura e a gravação, a transação inteira é revertida (inclusive o
// Cliente/TimelineEvent recém-criados, que não ficam órfãos).
export async function convertLeadToCliente(
  leadId: string,
  values: ConvertLeadValues,
): Promise<AcaoLeadResult<{ id: string }>> {
  await requireAuth();
  const data = convertLeadSchema.parse(values);

  try {
    const cliente = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
      if (lead.clienteId) {
        throw new Error("LEAD_JA_CONVERTIDO");
      }

      const clienteCriado = await tx.cliente.create({
        data: {
          nome: lead.nome,
          empresa: lead.empresa,
          whatsapp: lead.whatsapp,
          instagram: lead.instagram,
          email: lead.email,
          nicho: clean(data.nicho),
          planoContratado: clean(data.planoContratado),
          valor: data.valor ?? lead.valorEstimado ?? null,
          responsavelId: clean(data.responsavelId),
          status: "EM_PRODUCAO",
        },
      });

      await tx.timelineEvent.create({
        data: {
          clienteId: clienteCriado.id,
          titulo: "Cliente criado",
          descricao: "Convertido a partir de um lead fechado.",
        },
      });

      // O CAS inclui etapa: lead.etapa (não só clienteId: null) — sem isso, um
      // lead movido de etapa por outro processo entre a leitura acima e este
      // update ainda passaria a condição, e a decisão de pular
      // etapaAlteradaEm (baseada na etapa já obsoleta que lemos) deixaria o
      // registro com a etapa nova mas o timestamp da mudança anterior.
      const result = await tx.lead.updateMany({
        where: { id: leadId, clienteId: null, etapa: lead.etapa },
        data: {
          etapa: "FECHADO",
          clienteId: clienteCriado.id,
          ...(lead.etapa !== "FECHADO" ? { etapaAlteradaEm: new Date() } : {}),
        },
      });

      if (result.count === 0) {
        throw new Error("LEAD_JA_CONVERTIDO");
      }

      await tx.activityLog.create({
        data: {
          tipo: "cliente_criado",
          descricao: `Novo cliente '${clienteCriado.nome}'${clienteCriado.empresa ? ` (${clienteCriado.empresa})` : ""} cadastrado`,
          entidadeTipo: "cliente",
          entidadeId: clienteCriado.id,
        },
      });

      return clienteCriado;
    });

    revalidatePath("/leads");
    revalidatePath("/clientes");
    revalidatePath("/");
    return { ok: true, data: { id: cliente.id } };
  } catch (e) {
    if (e instanceof Error && e.message === "LEAD_JA_CONVERTIDO") {
      return { ok: false, erro: "LEAD_JA_CONVERTIDO" };
    }
    throw e;
  }
}
