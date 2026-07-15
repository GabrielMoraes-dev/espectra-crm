import { prisma } from "@/lib/prisma";

export async function getPesquisaStats() {
  const notas = await prisma.pesquisaSatisfacao.findMany({
    select: { nota: true },
  });

  const porNota = [1, 2, 3, 4, 5].map((nota) => ({
    nota,
    total: notas.filter((r) => r.nota === nota).length,
  }));

  return { porNota };
}

export type PesquisaStats = Awaited<ReturnType<typeof getPesquisaStats>>;
