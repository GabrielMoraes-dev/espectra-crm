"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { projetoSchema, type ProjetoFormValues } from "@/lib/validations";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { requireAuth } from "@/lib/auth/session";
import { handleClienteStatusChange, dispararEfeitosExternosStatusCliente } from "@/lib/actions/cliente-actions";
import type { Cliente, StatusCliente } from "@/generated/prisma/client";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createProjeto(values: ProjetoFormValues) {
  await requireAuth();
  const data = projetoSchema.parse(values);

  const projeto = await prisma.projeto.create({
    data: {
      clienteId: data.clienteId,
      prazo: data.prazo ? new Date(data.prazo) : null,
      responsavelId: clean(data.responsavelId),
      status: data.status,
      observacoes: clean(data.observacoes),
    },
    include: { cliente: true },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "projeto",
      descricao: `Novo projeto criado para ${projeto.cliente.nome}`,
      entidadeTipo: "projeto",
      entidadeId: projeto.id,
    },
  });

  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
  return projeto;
}

async function registerStatusChange(
  projetoId: string,
  clienteId: string,
  clienteNome: string,
  novoStatus: keyof typeof ETAPA_PROJETO_CONFIG,
) {
  const label = ETAPA_PROJETO_CONFIG[novoStatus].label;

  // Log do projeto + (quando aplicável) mudança de status do Cliente e seus
  // efeitos internos ficam na mesma transação — mesmo racional de updateCliente
  // em cliente-actions.ts.
  const paraEfeitosExternos = await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        tipo: "projeto",
        descricao: `Projeto de ${clienteNome} avançou para ${label}`,
        entidadeTipo: "projeto",
        entidadeId: projetoId,
      },
    });

    if (novoStatus === "PUBLICADO") {
      const clienteAntes = await tx.cliente.findUniqueOrThrow({ where: { id: clienteId } });
      if (clienteAntes.status !== "PUBLICADO") {
        const clienteDepois = await tx.cliente.update({
          where: { id: clienteId },
          data: { status: "PUBLICADO" },
        });
        await handleClienteStatusChange(tx, clienteDepois, clienteAntes.status);
        return { cliente: clienteDepois, statusAnterior: clienteAntes.status };
      }
    }

    return null as { cliente: Cliente; statusAnterior: StatusCliente } | null;
  });

  // Efeitos externos só depois do commit da transação acima.
  if (paraEfeitosExternos) {
    await dispararEfeitosExternosStatusCliente(paraEfeitosExternos.cliente, paraEfeitosExternos.statusAnterior);
  }
}

export async function updateProjeto(id: string, values: ProjetoFormValues) {
  await requireAuth();
  const data = projetoSchema.parse(values);
  const before = await prisma.projeto.findUniqueOrThrow({
    where: { id },
    include: { cliente: true },
  });
  const statusMudou = before.status !== data.status;

  const projeto = await prisma.projeto.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      prazo: data.prazo ? new Date(data.prazo) : null,
      responsavelId: clean(data.responsavelId),
      status: data.status,
      observacoes: clean(data.observacoes),
      // Checklist é por etapa — muda de etapa, começa do zero de novo.
      ...(statusMudou ? { checklistConcluido: "[]" } : {}),
    },
    include: { cliente: true },
  });

  if (before.status !== projeto.status) {
    await registerStatusChange(projeto.id, projeto.clienteId, projeto.cliente.nome, projeto.status);
  }

  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
  return projeto;
}

export async function moveProjetoEtapa(id: string, status: ProjetoFormValues["status"]) {
  await requireAuth();
  const projeto = await prisma.projeto.update({
    where: { id },
    data: { status, checklistConcluido: "[]" },
    include: { cliente: true },
  });

  await registerStatusChange(projeto.id, projeto.clienteId, projeto.cliente.nome, projeto.status);

  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
  return projeto;
}

export async function toggleChecklistItem(id: string, itemId: string) {
  await requireAuth();
  const projeto = await prisma.projeto.findUniqueOrThrow({ where: { id } });
  const concluidos: string[] = JSON.parse(projeto.checklistConcluido || "[]");
  const novo = concluidos.includes(itemId)
    ? concluidos.filter((i) => i !== itemId)
    : [...concluidos, itemId];

  await prisma.projeto.update({
    where: { id },
    data: { checklistConcluido: JSON.stringify(novo) },
  });

  revalidatePath("/projetos");
  revalidatePath(`/clientes/${projeto.clienteId}`);
}

export async function deleteProjeto(id: string) {
  await requireAuth();
  const projeto = await prisma.projeto.delete({ where: { id } });
  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
}
