import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type LeadsFilter = {
  search?: string;
  etapa?: string;
  origem?: string;
  sort?: "recentes" | "antigos" | "maior-valor" | "menor-valor";
};

export async function getLeads(filter: LeadsFilter) {
  const where: Prisma.LeadWhereInput = {};

  if (filter.search) {
    where.OR = [
      { nome: { contains: filter.search } },
      { empresa: { contains: filter.search } },
      { email: { contains: filter.search } },
    ];
  }

  if (filter.etapa && filter.etapa !== "todas") {
    where.etapa = filter.etapa as Prisma.LeadWhereInput["etapa"];
  }

  if (filter.origem && filter.origem !== "todas") {
    where.origem = filter.origem;
  }

  const orderBy: Prisma.LeadOrderByWithRelationInput =
    filter.sort === "antigos"
      ? { createdAt: "asc" }
      : filter.sort === "maior-valor"
        ? { valorEstimado: "desc" }
        : filter.sort === "menor-valor"
          ? { valorEstimado: "asc" }
          : { createdAt: "desc" };

  return prisma.lead.findMany({ where, orderBy });
}

export async function getAllLeadsForKanban() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}
