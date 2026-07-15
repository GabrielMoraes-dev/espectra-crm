"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { sendPagamentoConfirmadoEmail, sendPagamentoRecebidoInterno } from "@/lib/email";

export async function vincularPagamentoSemMatch(id: string, clienteId: string) {
  await requireAuth();
  const registro = await prisma.pagamentoSemMatch.findUniqueOrThrow({ where: { id } });

  const cliente = await prisma.$transaction(async (tx) => {
    // resolvido: false na condição — se essa ação for chamada duas vezes em corrida
    // (duplo clique, retry), só a primeira encontra o registro ainda em aberto.
    const { count } = await tx.pagamentoSemMatch.updateMany({
      where: { id, resolvido: false },
      data: { resolvido: true },
    });
    if (count === 0) {
      throw new Error("Esse pagamento já foi resolvido por outra ação.");
    }

    await tx.pagamento.create({
      data: { clienteId, valor: registro.valor, pago: true },
    });

    await tx.timelineEvent.create({
      data: {
        clienteId,
        titulo: "Pagamento concluído",
        descricao: `Vinculado manualmente a partir de um pagamento sem correspondência automática.`,
      },
    });

    await tx.activityLog.create({
      data: {
        tipo: "pagamento_confirmado",
        descricao: `Pagamento de ${registro.nome} vinculado manualmente ao cliente`,
        entidadeTipo: "cliente",
        entidadeId: clienteId,
      },
    });

    return tx.cliente.findUniqueOrThrow({ where: { id: clienteId } });
  });

  await sendPagamentoConfirmadoEmail(cliente, registro.valor);
  await sendPagamentoRecebidoInterno(cliente, registro.valor);

  revalidatePath("/");
  revalidatePath("/financeiro");
  revalidatePath(`/clientes/${clienteId}`);
}

export async function descartarPagamentoSemMatch(id: string) {
  await requireAuth();
  await prisma.pagamentoSemMatch.update({ where: { id }, data: { resolvido: true } });
  revalidatePath("/");
}
