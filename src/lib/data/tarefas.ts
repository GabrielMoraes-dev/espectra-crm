import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type TarefasFilter = {
  search?: string;
  responsavelId?: string;
  prioridade?: string;
};

export async function getTarefas(filter: TarefasFilter) {
  const where: Prisma.TarefaWhereInput = {};

  if (filter.search) {
    where.titulo = { contains: filter.search, mode: "insensitive" };
  }
  if (filter.responsavelId && filter.responsavelId !== "todos") {
    where.responsavelId = filter.responsavelId;
  }
  if (filter.prioridade && filter.prioridade !== "todas") {
    where.prioridade = filter.prioridade as Prisma.TarefaWhereInput["prioridade"];
  }

  return prisma.tarefa.findMany({
    where,
    orderBy: [{ prazo: "asc" }, { createdAt: "desc" }],
    include: { responsavel: true, cliente: true },
  });
}
