"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { projetoSchema, type ProjetoFormValues } from "@/lib/validations";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { requireAuth } from "@/lib/auth/session";
import { handleClienteStatusChange } from "@/lib/actions/cliente-actions";

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

  await prisma.activityLog.create({
    data: {
      tipo: "projeto",
      descricao: `Projeto de ${clienteNome} avançou para ${label}`,
      entidadeTipo: "projeto",
      entidadeId: projetoId,
    },
  });

  if (novoStatus === "PUBLICADO") {
    const clienteAntes = await prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } });
    if (clienteAntes.status !== "PUBLICADO") {
      const clienteDepois = await prisma.cliente.update({
        where: { id: clienteId },
        data: { status: "PUBLICADO" },
      });
      await handleClienteStatusChange(clienteDepois, clienteAntes.status);
    }
  }
}

export async function updateProjeto(id: string, values: ProjetoFormValues) {
  await requireAuth();
  const data = projetoSchema.parse(values);
  const before = await prisma.projeto.findUniqueOrThrow({
    where: { id },
    include: { cliente: true },
  });

  const projeto = await prisma.projeto.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      prazo: data.prazo ? new Date(data.prazo) : null,
      responsavelId: clean(data.responsavelId),
      status: data.status,
      observacoes: clean(data.observacoes),
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
    data: { status },
    include: { cliente: true },
  });

  await registerStatusChange(projeto.id, projeto.clienteId, projeto.cliente.nome, projeto.status);

  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
  return projeto;
}

export async function deleteProjeto(id: string) {
  await requireAuth();
  const projeto = await prisma.projeto.delete({ where: { id } });
  revalidatePath("/projetos");
  revalidatePath("/");
  revalidatePath(`/clientes/${projeto.clienteId}`);
}
