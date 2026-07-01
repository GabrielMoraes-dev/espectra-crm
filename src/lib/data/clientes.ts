import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ClientesFilter = {
  search?: string;
  status?: string;
  nicho?: string;
  sort?: "recentes" | "antigos" | "maior-valor" | "menor-valor";
};

export async function getClientes(filter: ClientesFilter) {
  const where: Prisma.ClienteWhereInput = {};

  if (filter.search) {
    where.OR = [
      { nome: { contains: filter.search } },
      { empresa: { contains: filter.search } },
      { email: { contains: filter.search } },
    ];
  }

  if (filter.status && filter.status !== "todos") {
    where.status = filter.status as Prisma.ClienteWhereInput["status"];
  }

  if (filter.nicho && filter.nicho !== "todos") {
    where.nicho = filter.nicho;
  }

  const orderBy: Prisma.ClienteOrderByWithRelationInput =
    filter.sort === "antigos"
      ? { dataEntrada: "asc" }
      : filter.sort === "maior-valor"
        ? { valor: "desc" }
        : filter.sort === "menor-valor"
          ? { valor: "asc" }
          : { dataEntrada: "desc" };

  return prisma.cliente.findMany({
    where,
    orderBy,
    include: { responsavel: true },
  });
}

export async function getClienteById(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      responsavel: true,
      timeline: { orderBy: { data: "desc" } },
      projetos: { orderBy: { createdAt: "desc" } },
      pagamentos: { orderBy: { data: "desc" } },
    },
  });
}
