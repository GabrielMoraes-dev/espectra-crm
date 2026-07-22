"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { briefingSchema, type BriefingFormValues } from "@/lib/validations";
import { sendBriefingNotification, sendBriefingConfirmation } from "@/lib/email";
import { getIp, verificarRateLimit } from "@/lib/rate-limit";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createBriefing(values: BriefingFormValues) {
  await verificarRateLimit("criar_briefing", await getIp(), 10, 15 * 60 * 1000);
  const data = briefingSchema.parse(values);

  let clienteId = clean(data.clienteId);
  const leadId = clean(data.leadId);

  // Proteção no servidor (não só na UI): nenhum Briefing sem vínculo válido.
  // Sem isso, uma chamada direta da action (ou um link sem identificador)
  // criava um registro órfão, sem Lead nem Cliente.
  if (!leadId && !clienteId) {
    throw new Error("Link inválido: nenhum lead ou cliente vinculado.");
  }

  const briefing = await prisma.$transaction(async (tx) => {
    if (leadId) {
      const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
      // Único par válido quando os dois ids vêm juntos: o Cliente já é
      // exatamente o vinculado a esse Lead. Qualquer outra combinação é
      // rejeitada — inclusive quando o Lead ainda não tem Cliente nenhum
      // (lead.clienteId === null) e um clienteId arbitrário foi informado, o
      // que antes passava batido e ligava o briefing a um cliente errado.
      if (clienteId && lead.clienteId !== clienteId) {
        throw new Error("Link inválido: lead e cliente não correspondem.");
      }
    }

    // Reivindica a conversão automática do Lead pro Cliente com o mesmo CAS
    // completo (clienteId + etapa) usado em convertLeadToCliente — sem incluir
    // `etapa` na condição, uma mudança de etapa concorrente (ex: alguém movendo
    // o Kanban) passaria pela condição e a decisão de pular `etapaAlteradaEm`
    // (baseada na etapa já obsoleta que lemos) deixaria a etapa nova com o
    // timestamp da mudança anterior. No máximo 2 tentativas — não é loop
    // indefinido, só cobre a corrida rara de a etapa mudar entre a leitura e o
    // update. Resultado discriminado por `tipo` (nunca `null` sozinho) — usar
    // null pra dizer "ganhou o CAS" e também "perdeu de vez" fazia o chamador
    // tratar os dois casos como "pode criar Cliente", reabrindo a própria
    // corrida que o CAS deveria impedir.
    type ResultadoReivindicacao =
      | { tipo: "ja_convertido"; clienteId: string }
      | { tipo: "conquistado" }
      | { tipo: "conflito_persistente" };

    async function reivindicarConversaoAutomatica(leadIdConfirmado: string): Promise<ResultadoReivindicacao> {
      for (let tentativa = 0; tentativa < 2; tentativa++) {
        const leadAtual = await tx.lead.findUniqueOrThrow({ where: { id: leadIdConfirmado } });
        if (leadAtual.clienteId) return { tipo: "ja_convertido", clienteId: leadAtual.clienteId };

        const claimed = await tx.lead.updateMany({
          where: { id: leadIdConfirmado, clienteId: null, etapa: leadAtual.etapa },
          data: {
            etapa: "FECHADO",
            ...(leadAtual.etapa !== "FECHADO" ? { etapaAlteradaEm: new Date() } : {}),
          },
        });

        if (claimed.count === 1) return { tipo: "conquistado" };
      }
      // Depois de 2 tentativas sem ganhar o CAS e sem o Lead ter sido convertido
      // por ninguém: a etapa manual continua mudando na mesma hora exata —
      // extremamente raro. Não cria Cliente nesta chamada (evitaria duplicar);
      // a transação inteira falha e o prospect pode reenviar o formulário.
      return { tipo: "conflito_persistente" };
    }

    if (leadId && !clienteId) {
      const resultado = await reivindicarConversaoAutomatica(leadId);

      if (resultado.tipo === "ja_convertido") {
        // Já convertido por outra requisição concorrente (ou reenvio do link) — reaproveita o cliente existente.
        clienteId = resultado.clienteId;
      } else if (resultado.tipo === "conflito_persistente") {
        throw new Error("CONVERSAO_EM_CONFLITO");
      } else {
        const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });

        const cliente = await tx.cliente.create({
          data: {
            nome: data.nome,
            empresa: lead.empresa,
            whatsapp: data.whatsapp,
            instagram: clean(data.instagram) ?? lead.instagram,
            email: data.email,
            cidade: data.cidade,
            estado: clean(data.estado),
            nicho: data.profissao,
            cpfCnpj: data.cpfCnpj,
            valor: lead.valorEstimado ?? null,
            status: "EM_PRODUCAO",
          },
        });

        await tx.lead.update({ where: { id: leadId }, data: { clienteId: cliente.id } });

        for (const url of data.fotosUrls ?? []) {
          await tx.fotoCliente.create({ data: { clienteId: cliente.id, url } });
        }

        await tx.projeto.create({
          data: { clienteId: cliente.id, status: "BRIEFING" },
        });

        await tx.timelineEvent.create({
          data: {
            clienteId: cliente.id,
            titulo: "Cliente criado",
            descricao: "Convertido automaticamente a partir do briefing enviado pelo lead.",
          },
        });

        await tx.activityLog.create({
          data: {
            tipo: "cliente_criado",
            descricao: `Novo cliente '${cliente.nome}' criado automaticamente a partir do briefing`,
            entidadeTipo: "cliente",
            entidadeId: cliente.id,
          },
        });

        clienteId = cliente.id;
      }
    }

    const camposBriefing = {
      leadId,
      clienteId,
      nome: data.nome,
      profissao: data.profissao,
      cidade: data.cidade,
      estado: clean(data.estado),
      email: data.email,
      whatsapp: data.whatsapp,
      instagram: clean(data.instagram),
      cpfCnpj: clean(data.cpfCnpj),
      registroProfissional: clean(data.registroProfissional),
      apresentacao: data.apresentacao,
      historia: data.historia,
      especialidades: data.especialidades,
      numeroDestaque: clean(data.numeroDestaque),
      diferenciais: data.diferenciais,
      motivoProcura: data.motivoProcura,
      servicos: data.servicos,
      atendimento: data.atendimento,
      ondeAtende: clean(data.ondeAtende),
      enderecoFisico: clean(data.enderecoFisico),
      valoresServicos: clean(data.valoresServicos),
      dominio: clean(data.dominio),
      faqAgendamento: clean(data.faqAgendamento),
      faqAntesConsulta: clean(data.faqAntesConsulta),
      faqCancelamento: clean(data.faqCancelamento),
      faqHorarios: clean(data.faqHorarios),
      depoimentosUrls: JSON.stringify(data.depoimentosUrls ?? []),
      fotosUrls: JSON.stringify(data.fotosUrls ?? []),
      arquivosGeraisUrls: JSON.stringify(data.arquivosGeraisUrls),
    };

    // Reenvio (mesmo Lead ou mesmo Cliente já com um Briefing) atualiza o
    // registro existente em vez de duplicar — mesmo padrão já usado em
    // createBriefingInicial. `orderBy` garante determinismo mesmo que já
    // exista mais de um registro de uma duplicidade antiga (usa o mais recente).
    // Não fecha 100% a corrida de duas submissões simultâneas do primeiro
    // envio (mesma limitação já aceita hoje em createBriefingInicial) — ver
    // memory/jornada-completa-do-cliente.md para o registro dessa limitação.
    const existente = leadId
      ? await tx.briefing.findFirst({ where: { leadId }, orderBy: { createdAt: "desc" } })
      : await tx.briefing.findFirst({ where: { clienteId }, orderBy: { createdAt: "desc" } });

    const created = existente
      ? await tx.briefing.update({ where: { id: existente.id }, data: camposBriefing })
      : await tx.briefing.create({ data: camposBriefing });

    if (clienteId) {
      const clienteAtual = await tx.cliente.findUniqueOrThrow({ where: { id: clienteId } });

      await tx.cliente.update({
        where: { id: clienteId },
        data: {
          cpfCnpj: clienteAtual.cpfCnpj ?? data.cpfCnpj,
          instagram: clienteAtual.instagram ?? clean(data.instagram),
          email: clienteAtual.email ?? data.email,
          cidade: clienteAtual.cidade ?? data.cidade,
          estado: clienteAtual.estado ?? clean(data.estado),
          whatsapp: clienteAtual.whatsapp ?? data.whatsapp,
        },
      });

      await tx.timelineEvent.create({
        data: {
          clienteId,
          titulo: "Briefing recebido",
          descricao: "O cliente preencheu o formulário de briefing.",
        },
      });
    }

    await tx.activityLog.create({
      data: {
        tipo: "briefing_recebido",
        descricao: `Briefing recebido de '${created.nome}'${clienteId ? "" : " (sem cliente vinculado)"}`,
        entidadeTipo: "briefing",
        entidadeId: created.id,
      },
    });

    return created;
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");
  if (briefing.clienteId) revalidatePath(`/clientes/${briefing.clienteId}`);
  revalidatePath("/");

  await sendBriefingNotification(briefing);
  await sendBriefingConfirmation(briefing);

  return briefing;
}
