import { prisma } from "@/lib/prisma";

export async function getPesquisaStats() {
  const notas = await prisma.pesquisaSatisfacao.findMany({
    select: { nota: true },
  });

  const total = notas.length;
  const mediaNota = total > 0 ? notas.reduce((sum, r) => sum + r.nota, 0) / total : 0;

  const porNota = [1, 2, 3, 4, 5].map((nota) => ({
    nota,
    total: notas.filter((r) => r.nota === nota).length,
  }));

  return { total, mediaNota, porNota };
}

export type PesquisaStats = Awaited<ReturnType<typeof getPesquisaStats>>;
