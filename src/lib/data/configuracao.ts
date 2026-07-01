import { prisma } from "@/lib/prisma";

export async function getConfiguracao() {
  const existing = await prisma.configuracaoEmpresa.findFirst();
  if (existing) return existing;
  return prisma.configuracaoEmpresa.create({ data: {} });
}
