"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sopSchema, type SOPFormValues } from "@/lib/validations";
import { requireAuth } from "@/lib/auth/session";

export async function updateSOP(id: string, values: SOPFormValues) {
  await requireAuth();
  const data = sopSchema.parse(values);
  const sop = await prisma.sOP.update({
    where: { id },
    data: { conteudo: data.conteudo?.trim() || null },
  });
  revalidatePath("/estrutura-operacional");
  return sop;
}
