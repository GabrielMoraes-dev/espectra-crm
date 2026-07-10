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
      { nome: { contains: filter.search, mode: "insensitive" } },
      { empresa: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
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
      briefings: { orderBy: { createdAt: "desc" } },
      pesquisas: { orderBy: { createdAt: "desc" } },
      lead: {
        select: {
          id: true,
          briefingsIniciais: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
}

export async function getClienteForPrefill(clienteId: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: {
      id: true,
      nome: true,
      whatsapp: true,
      instagram: true,
      email: true,
      cidade: true,
      estado: true,
      nicho: true,
      lead: {
        select: {
          briefingsIniciais: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { nome: true, profissao: true, apresentacao: true, fotosUrls: true },
          },
        },
      },
    },
  });
  if (!cliente) return null;

  const briefingInicial = cliente.lead?.briefingsIniciais[0];
  return {
    id: cliente.id,
    nome: cliente.nome,
    whatsapp: cliente.whatsapp,
    instagram: cliente.instagram,
    email: cliente.email,
    cidade: cliente.cidade,
    estado: cliente.estado,
    nicho: cliente.nicho,
    nomeInicial: briefingInicial?.nome ?? null,
    profissaoInicial: briefingInicial?.profissao ?? null,
    apresentacaoInicial: briefingInicial?.apresentacao ?? null,
    fotosUrlsIniciais: briefingInicial ? (JSON.parse(briefingInicial.fotosUrls) as string[]) : [],
  };
}

export async function getClienteForPesquisa(clienteId: string) {
  return prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, nome: true },
  });
}
