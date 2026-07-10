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
      { nome: { contains: filter.search, mode: "insensitive" } },
      { empresa: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
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

  return prisma.lead.findMany({
    where,
    orderBy,
    include: {
      briefingsIniciais: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export type LeadComBriefing = Awaited<ReturnType<typeof getLeads>>[number];

export async function getAllLeadsForKanban() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getLeadForPrefill(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      nome: true,
      empresa: true,
      whatsapp: true,
      instagram: true,
      email: true,
      clienteId: true,
      briefingsIniciais: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { nome: true, profissao: true, email: true, apresentacao: true, fotosUrls: true },
      },
    },
  });
  if (!lead) return null;

  const briefingInicial = lead.briefingsIniciais[0];
  return {
    id: lead.id,
    nome: lead.nome,
    empresa: lead.empresa,
    whatsapp: lead.whatsapp,
    instagram: lead.instagram,
    email: lead.email,
    clienteId: lead.clienteId,
    nomeInicial: briefingInicial?.nome ?? null,
    profissaoInicial: briefingInicial?.profissao ?? null,
    emailInicial: briefingInicial?.email ?? null,
    apresentacaoInicial: briefingInicial?.apresentacao ?? null,
    fotosUrlsIniciais: briefingInicial ? (JSON.parse(briefingInicial.fotosUrls) as string[]) : [],
  };
}
