"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function vincularPagamentoSemMatch(id: string, clienteId: string) {
  await requireAuth();
  const registro = await prisma.pagamentoSemMatch.findUniqueOrThrow({ where: { id } });

  await prisma.pagamento.create({
    data: { clienteId, valor: registro.valor, pago: true },
  });

  await prisma.timelineEvent.create({
    data: {
      clienteId,
      titulo: "Pagamento concluído",
      descricao: `Vinculado manualmente a partir de um pagamento sem correspondência automática.`,
    },
  });

  await prisma.pagamentoSemMatch.update({ where: { id }, data: { resolvido: true } });

  revalidatePath("/");
  revalidatePath("/financeiro");
  revalidatePath(`/clientes/${clienteId}`);
}

export async function descartarPagamentoSemMatch(id: string) {
  await requireAuth();
  await prisma.pagamentoSemMatch.update({ where: { id }, data: { resolvido: true } });
  revalidatePath("/");
}
