import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const POR_PAGINA = 30;

export type AtividadesFilter = {
  search?: string;
  tipo?: string;
  page?: number;
};

export async function getAtividades(filter: AtividadesFilter) {
  const where: Prisma.ActivityLogWhereInput = {};

  if (filter.search) {
    where.descricao = { contains: filter.search, mode: "insensitive" };
  }
  if (filter.tipo && filter.tipo !== "todos") {
    where.tipo = filter.tipo;
  }

  const page = Math.max(1, filter.page ?? 1);

  const [atividades, total, tipos] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      distinct: ["tipo"],
      select: { tipo: true },
      orderBy: { tipo: "asc" },
    }),
  ]);

  return {
    atividades,
    total,
    page,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    tipos: tipos.map((t) => t.tipo),
  };
}
