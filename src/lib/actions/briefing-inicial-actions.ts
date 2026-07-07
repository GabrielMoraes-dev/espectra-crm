"use server";

import { prisma } from "@/lib/prisma";
import { briefingInicialSchema, type BriefingInicialFormValues } from "@/lib/validations";
import { sendBriefingInicialNotification } from "@/lib/email";

export async function createBriefingInicial(values: BriefingInicialFormValues) {
  const data = briefingInicialSchema.parse(values);

  const briefingInicial = await prisma.briefingInicial.create({
    data: {
      leadId: data.leadId,
      nome: data.nome,
      profissao: data.profissao,
      apresentacao: data.apresentacao,
      fotosUrls: JSON.stringify(data.fotosUrls),
    },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "briefing_inicial_recebido",
      descricao: `Briefing inicial recebido de '${briefingInicial.nome}'`,
      entidadeTipo: "lead",
      entidadeId: data.leadId,
    },
  });

  await sendBriefingInicialNotification(briefingInicial);

  return briefingInicial;
}
