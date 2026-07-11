"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { briefingInicialSchema, type BriefingInicialFormValues } from "@/lib/validations";
import { sendBriefingInicialNotification, sendBriefingInicialConfirmation } from "@/lib/email";
import { requireAuth } from "@/lib/auth/session";

export async function createBriefingInicial(values: BriefingInicialFormValues) {
  const data = briefingInicialSchema.parse(values);

  const briefingInicial = await prisma.briefingInicial.create({
    data: {
      leadId: data.leadId,
      nome: data.nome,
      profissao: data.profissao,
      email: data.email,
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
  await sendBriefingInicialConfirmation(briefingInicial);

  return briefingInicial;
}

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

  const briefingInicial = await prisma.briefingInicial.update({
    where: { id },
    data: {
      nome: values.nome,
      profissao: values.profissao,
      email: values.email,
      apresentacao: values.apresentacao,
      fotosUrls: JSON.stringify(values.fotosUrls),
    },
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");

  return briefingInicial;
}
