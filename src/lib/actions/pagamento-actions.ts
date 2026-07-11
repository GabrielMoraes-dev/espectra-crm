"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pagamentoSchema, type PagamentoFormValues } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/session";
import { CAKTO_LINKS_POR_PRECO } from "@/lib/constants";
import { sendPagamentoConfirmadoEmail } from "@/lib/email";

export async function gerarLinkPagamento(clienteId: string, preco: number) {
  await requireAuth();
  const cliente = await prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } });
  const linkBase = CAKTO_LINKS_POR_PRECO[preco];
  if (!linkBase) throw new Error("Preço inválido");

  await prisma.pagamento.create({
    data: { clienteId: cliente.id, valor: preco, pago: false },
  });

  revalidatePath("/financeiro");
  revalidatePath(`/clientes/${cliente.id}`);
  revalidatePath("/");

  return `${linkBase}?sck=${cliente.id}`;
}

export async function createPagamento(values: PagamentoFormValues) {
  await requireAuth();
  const data = pagamentoSchema.parse(values);

  const pagamento = await prisma.pagamento.create({
    data: {
      clienteId: data.clienteId,
      valor: data.valor,
      pago: data.pago,
      formaPagamento: data.formaPagamento || null,
      data: data.data ? new Date(data.data) : new Date(),
    },
    include: { cliente: true },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "pagamento",
      descricao: data.pago
        ? `Pagamento de ${formatCurrency(pagamento.valor)} confirmado por ${pagamento.cliente.nome}`
        : `Pagamento de ${formatCurrency(pagamento.valor)} pendente para ${pagamento.cliente.nome}`,
      entidadeTipo: "pagamento",
      entidadeId: pagamento.id,
    },
  });

  if (data.pago) {
    await prisma.timelineEvent.create({
      data: {
        clienteId: pagamento.clienteId,
        titulo: "Pagamento concluído",
        descricao: `${formatCurrency(pagamento.valor)} confirmado.`,
      },
    });
    await sendPagamentoConfirmadoEmail(pagamento.cliente, pagamento.valor);
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  revalidatePath(`/clientes/${pagamento.clienteId}`);
  return pagamento;
}

export async function updatePagamento(id: string, values: PagamentoFormValues) {
  await requireAuth();
  const data = pagamentoSchema.parse(values);
  const before = await prisma.pagamento.findUniqueOrThrow({ where: { id } });

  const pagamento = await prisma.pagamento.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      valor: data.valor,
      pago: data.pago,
      formaPagamento: data.formaPagamento || null,
      data: data.data ? new Date(data.data) : new Date(),
    },
    include: { cliente: true },
  });

  if (!before.pago && pagamento.pago) {
    await prisma.activityLog.create({
      data: {
        tipo: "pagamento",
        descricao: `Pagamento de ${formatCurrency(pagamento.valor)} confirmado por ${pagamento.cliente.nome}`,
        entidadeTipo: "pagamento",
        entidadeId: pagamento.id,
      },
    });
    await prisma.timelineEvent.create({
      data: {
        clienteId: pagamento.clienteId,
        titulo: "Pagamento concluído",
        descricao: `${formatCurrency(pagamento.valor)} confirmado.`,
      },
    });
    await sendPagamentoConfirmadoEmail(pagamento.cliente, pagamento.valor);
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  revalidatePath(`/clientes/${pagamento.clienteId}`);
  return pagamento;
}

export async function togglePagamentoPago(id: string, pago: boolean) {
  await requireAuth();
  const pagamento = await prisma.pagamento.update({
    where: { id },
    data: { pago },
    include: { cliente: true },
  });

  if (pago) {
    await prisma.activityLog.create({
      data: {
        tipo: "pagamento",
        descricao: `Pagamento de ${formatCurrency(pagamento.valor)} confirmado por ${pagamento.cliente.nome}`,
        entidadeTipo: "pagamento",
        entidadeId: pagamento.id,
      },
    });
    await prisma.timelineEvent.create({
      data: {
        clienteId: pagamento.clienteId,
        titulo: "Pagamento concluído",
        descricao: `${formatCurrency(pagamento.valor)} confirmado.`,
      },
    });
    await sendPagamentoConfirmadoEmail(pagamento.cliente, pagamento.valor);
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  revalidatePath(`/clientes/${pagamento.clienteId}`);
  return pagamento;
}

export async function deletePagamento(id: string) {
  await requireAuth();
  const pagamento = await prisma.pagamento.findUniqueOrThrow({ where: { id } });
  await prisma.pagamento.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath("/");
  revalidatePath(`/clientes/${pagamento.clienteId}`);
}
