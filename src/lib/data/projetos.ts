import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ProjetosFilter = {
  search?: string;
  status?: string;
  sort?: "recentes" | "antigos" | "prazo";
};

export async function getProjetos(filter: ProjetosFilter) {
  const where: Prisma.ProjetoWhereInput = {};

  if (filter.search) {
    where.cliente = {
      OR: [
        { nome: { contains: filter.search } },
        { empresa: { contains: filter.search } },
      ],
    };
  }

  if (filter.status && filter.status !== "todas") {
    where.status = filter.status as Prisma.ProjetoWhereInput["status"];
  }

  const orderBy: Prisma.ProjetoOrderByWithRelationInput =
    filter.sort === "antigos"
      ? { createdAt: "asc" }
      : filter.sort === "prazo"
        ? { prazo: "asc" }
        : { createdAt: "desc" };

  return prisma.projeto.findMany({
    where,
    orderBy,
    include: {
      cliente: { include: { fotos: { orderBy: { createdAt: "desc" } } } },
      responsavel: true,
    },
  });
}
