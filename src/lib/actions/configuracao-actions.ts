"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { configuracaoSchema, type ConfiguracaoFormValues } from "@/lib/validations";
import { requireAuth } from "@/lib/auth/session";

export async function updateConfiguracao(id: string, values: ConfiguracaoFormValues) {
  await requireAuth();
  const data = configuracaoSchema.parse(values);

  const config = await prisma.configuracaoEmpresa.update({
    where: { id },
    data: {
      nomeEmpresa: data.nomeEmpresa,
      logoUrl: data.logoUrl?.trim() || null,
      sobre: data.sobre?.trim() || null,
      metaFaturamentoMensal: data.metaFaturamentoMensal ?? null,
    },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/", "layout");
  return config;
}
