"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export type ResultadoBusca = {
  tipo: "lead" | "cliente" | "projeto" | "tarefa";
  id: string;
  titulo: string;
  subtitulo: string | null;
  href: string;
};

const LIMITE_POR_TIPO = 5;

export async function buscarGlobal(query: string): Promise<ResultadoBusca[]> {
  await requireAuth();
  const termo = query.trim();
  if (termo.length < 2) return [];

  const [leads, clientes, projetos, tarefas] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { nome: { contains: termo, mode: "insensitive" } },
          { empresa: { contains: termo, mode: "insensitive" } },
        ],
      },
      take: LIMITE_POR_TIPO,
      select: { id: true, nome: true, empresa: true },
    }),
    prisma.cliente.findMany({
      where: {
        deletedAt: null,
        OR: [
          { nome: { contains: termo, mode: "insensitive" } },
          { empresa: { contains: termo, mode: "insensitive" } },
        ],
      },
      take: LIMITE_POR_TIPO,
      select: { id: true, nome: true, empresa: true },
    }),
    prisma.projeto.findMany({
      where: { cliente: { nome: { contains: termo, mode: "insensitive" }, deletedAt: null } },
      take: LIMITE_POR_TIPO,
      select: { id: true, clienteId: true, cliente: { select: { nome: true, empresa: true } } },
    }),
    prisma.tarefa.findMany({
      where: { titulo: { contains: termo, mode: "insensitive" } },
      take: LIMITE_POR_TIPO,
      select: { id: true, titulo: true, cliente: { select: { nome: true } } },
    }),
  ]);

  return [
    ...leads.map((l): ResultadoBusca => ({
      tipo: "lead",
      id: l.id,
      titulo: l.nome,
      subtitulo: l.empresa,
      href: `/leads?q=${encodeURIComponent(l.nome)}`,
    })),
    ...clientes.map((c): ResultadoBusca => ({
      tipo: "cliente",
      id: c.id,
      titulo: c.nome,
      subtitulo: c.empresa,
      href: `/clientes/${c.id}`,
    })),
    ...projetos.map((p): ResultadoBusca => ({
      tipo: "projeto",
      id: p.id,
      titulo: p.cliente.nome,
      subtitulo: p.cliente.empresa ?? "Projeto",
      href: `/clientes/${p.clienteId}`,
    })),
    ...tarefas.map((t): ResultadoBusca => ({
      tipo: "tarefa",
      id: t.id,
      titulo: t.titulo,
      subtitulo: t.cliente?.nome ?? null,
      href: `/tarefas?q=${encodeURIComponent(t.titulo)}`,
    })),
  ];
}
