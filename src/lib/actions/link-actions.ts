"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { linkInternoSchema, type LinkInternoFormValues } from "@/lib/validations";
import { requireAuth } from "@/lib/auth/session";

export async function createLinkInterno(values: LinkInternoFormValues) {
  await requireAuth();
  const data = linkInternoSchema.parse(values);
  // max(ordem)+1 em vez de count() — depois de excluir um link, count() não bate
  // mais com o maior ordem existente, podendo colidir com um link já existente.
  const ultimo = await prisma.linkInterno.findFirst({ orderBy: { ordem: "desc" } });
  const proximaOrdem = ultimo ? ultimo.ordem + 1 : 0;
  const link = await prisma.linkInterno.create({
    data: { nome: data.nome, url: data.url, icone: data.icone || null, ordem: proximaOrdem },
  });
  revalidatePath("/estrutura-operacional");
  return link;
}

export async function updateLinkInterno(id: string, values: LinkInternoFormValues) {
  await requireAuth();
  const data = linkInternoSchema.parse(values);
  const link = await prisma.linkInterno.update({
    where: { id },
    data: { nome: data.nome, url: data.url, icone: data.icone || null },
  });
  revalidatePath("/estrutura-operacional");
  return link;
}

export async function deleteLinkInterno(id: string) {
  await requireAuth();
  await prisma.linkInterno.delete({ where: { id } });
  revalidatePath("/estrutura-operacional");
}

export async function reordenarLinksInternos(ids: string[]) {
  await requireAuth();
  await prisma.$transaction(
    ids.map((id, ordem) => prisma.linkInterno.update({ where: { id }, data: { ordem } })),
  );
  revalidatePath("/estrutura-operacional");
}
