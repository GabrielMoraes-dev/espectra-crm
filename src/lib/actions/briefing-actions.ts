"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { briefingSchema, type BriefingFormValues } from "@/lib/validations";
import { sendBriefingNotification, sendBriefingConfirmation } from "@/lib/email";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createBriefing(values: BriefingFormValues) {
  const data = briefingSchema.parse(values);

  const briefing = await prisma.$transaction(async (tx) => {
    let clienteId = clean(data.clienteId);
    const leadId = clean(data.leadId);

    if (leadId && !clienteId) {
      // Trava atômica: só uma requisição concorrente "ganha" a conversão do lead.
      const claimed = await tx.lead.updateMany({
        where: { id: leadId, clienteId: null },
        data: { etapa: "FECHADO" },
      });

      if (claimed.count === 1) {
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
      } else {
        // Já convertido por outra requisição concorrente (ou reenvio do link) — reaproveita o cliente existente.
        const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
        clienteId = lead.clienteId;
      }
    }

    const created = await tx.briefing.create({
      data: {
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
        faqAgendamento: clean(data.faqAgendamento),
        faqAntesConsulta: clean(data.faqAntesConsulta),
        faqCancelamento: clean(data.faqCancelamento),
        faqHorarios: clean(data.faqHorarios),
        depoimentosUrls: JSON.stringify(data.depoimentosUrls ?? []),
        fotosUrls: JSON.stringify(data.fotosUrls ?? []),
        arquivosGeraisUrls: JSON.stringify(data.arquivosGeraisUrls),
      },
    });

    if (clienteId) {
      await tx.cliente.update({
        where: { id: clienteId },
        data: { cpfCnpj: data.cpfCnpj },
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
