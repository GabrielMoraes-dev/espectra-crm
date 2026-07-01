"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tarefaSchema, type TarefaFormValues } from "@/lib/validations";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createTarefa(values: TarefaFormValues) {
  const data = tarefaSchema.parse(values);

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: data.titulo,
      descricao: clean(data.descricao),
      responsavelId: clean(data.responsavelId),
      prazo: data.prazo ? new Date(data.prazo) : null,
      prioridade: data.prioridade,
      status: data.status,
    },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "tarefa",
      descricao: `Tarefa '${tarefa.titulo}' criada`,
      entidadeTipo: "tarefa",
      entidadeId: tarefa.id,
    },
  });

  revalidatePath("/tarefas");
  return tarefa;
}

export async function updateTarefa(id: string, values: TarefaFormValues) {
  const data = tarefaSchema.parse(values);
  const before = await prisma.tarefa.findUniqueOrThrow({ where: { id } });

  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: {
      titulo: data.titulo,
      descricao: clean(data.descricao),
      responsavelId: clean(data.responsavelId),
      prazo: data.prazo ? new Date(data.prazo) : null,
      prioridade: data.prioridade,
      status: data.status,
    },
  });

  if (before.status !== "CONCLUIDA" && tarefa.status === "CONCLUIDA") {
    await prisma.activityLog.create({
      data: {
        tipo: "tarefa",
        descricao: `Tarefa '${tarefa.titulo}' concluída`,
        entidadeTipo: "tarefa",
        entidadeId: tarefa.id,
      },
    });
  }

  revalidatePath("/tarefas");
  return tarefa;
}

export async function moveTarefaStatus(id: string, status: TarefaFormValues["status"]) {
  const tarefa = await prisma.tarefa.update({ where: { id }, data: { status } });

  if (status === "CONCLUIDA") {
    await prisma.activityLog.create({
      data: {
        tipo: "tarefa",
        descricao: `Tarefa '${tarefa.titulo}' concluída`,
        entidadeTipo: "tarefa",
        entidadeId: tarefa.id,
      },
    });
  }

  revalidatePath("/tarefas");
  return tarefa;
}

export async function deleteTarefa(id: string) {
  await prisma.tarefa.delete({ where: { id } });
  revalidatePath("/tarefas");
}
