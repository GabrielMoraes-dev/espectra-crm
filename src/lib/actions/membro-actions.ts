"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { membroSchema, type MembroFormValues } from "@/lib/validations";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createMembro(values: MembroFormValues) {
  const data = membroSchema.parse(values);

  const membro = await prisma.membroEquipe.create({
    data: {
      nome: data.nome,
      cargo: data.cargo,
      telefone: clean(data.telefone),
      email: clean(data.email),
      foto: clean(data.foto),
      responsabilidades: JSON.stringify(data.responsabilidades.filter(Boolean)),
    },
  });

  revalidatePath("/equipe");
  revalidatePath("/estrutura-operacional");
  return membro;
}

export async function updateMembro(id: string, values: MembroFormValues) {
  const data = membroSchema.parse(values);

  const membro = await prisma.membroEquipe.update({
    where: { id },
    data: {
      nome: data.nome,
      cargo: data.cargo,
      telefone: clean(data.telefone),
      email: clean(data.email),
      foto: clean(data.foto),
      responsabilidades: JSON.stringify(data.responsabilidades.filter(Boolean)),
    },
  });

  revalidatePath("/equipe");
  revalidatePath("/estrutura-operacional");
  return membro;
}

export async function deleteMembro(id: string) {
  await prisma.membroEquipe.delete({ where: { id } });
  revalidatePath("/equipe");
  revalidatePath("/estrutura-operacional");
}
