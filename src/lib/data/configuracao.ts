import { prisma } from "@/lib/prisma";

export async function getConfiguracao() {
  const existing = await prisma.configuracaoEmpresa.findFirst();
  if (existing) {
    if (!existing.logoUrl) {
      return prisma.configuracaoEmpresa.update({
        where: { id: existing.id },
        data: { logoUrl: "/logo-espectra.png" },
      });
    }
    return existing;
  }
  return prisma.configuracaoEmpresa.create({ data: { logoUrl: "/logo-espectra.png" } });
}
