"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { configuracaoSchema, type ConfiguracaoFormValues } from "@/lib/validations";

export async function updateConfiguracao(id: string, values: ConfiguracaoFormValues) {
  const data = configuracaoSchema.parse(values);

  const config = await prisma.configuracaoEmpresa.update({
    where: { id },
    data: {
      nomeEmpresa: data.nomeEmpresa,
      logoUrl: data.logoUrl?.trim() || null,
      sobre: data.sobre?.trim() || null,
    },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/", "layout");
  return config;
}
