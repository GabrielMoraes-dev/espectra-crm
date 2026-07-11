"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { briefingInicialSchema, type BriefingInicialFormValues } from "@/lib/validations";
import { sendBriefingInicialNotification, sendBriefingInicialConfirmation } from "@/lib/email";
import { requireAuth } from "@/lib/auth/session";

export async function createBriefingInicial(values: BriefingInicialFormValues) {
  const data = briefingInicialSchema.parse(values);

  // Reenvio do mesmo link atualiza o registro existente em vez de criar um duplicado.
  const existente = await prisma.briefingInicial.findFirst({ where: { leadId: data.leadId } });

  const camposComuns = {
    nome: data.nome,
    profissao: data.profissao,
    email: data.email,
    apresentacao: data.apresentacao,
    fotosUrls: JSON.stringify(data.fotosUrls),
  };

  const briefingInicial = existente
    ? await prisma.briefingInicial.update({ where: { id: existente.id }, data: camposComuns })
    : await prisma.briefingInicial.create({ data: { leadId: data.leadId, ...camposComuns } });

  await prisma.activityLog.create({
    data: {
      tipo: "briefing_inicial_recebido",
      descricao: `Briefing inicial recebido de '${briefingInicial.nome}'`,
      entidadeTipo: "lead",
      entidadeId: data.leadId,
    },
  });

  await sendBriefingInicialNotification(briefingInicial);
  await sendBriefingInicialConfirmation(briefingInicial);

  return briefingInicial;
}

const updateBriefingInicialSchema = briefingInicialSchema.omit({ leadId: true });

export async function updateBriefingInicial(
  id: string,
  values: {
    nome: string;
    profissao: string;
    email: string;
    apresentacao: string;
    fotosUrls: string[];
  },
) {
  await requireAuth();
  const data = updateBriefingInicialSchema.parse(values);

  const briefingInicial = await prisma.briefingInicial.update({
    where: { id },
    data: {
      nome: data.nome,
      profissao: data.profissao,
      email: data.email,
      apresentacao: data.apresentacao,
      fotosUrls: JSON.stringify(data.fotosUrls),
    },
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");

  return briefingInicial;
}
