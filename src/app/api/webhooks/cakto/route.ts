import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPagamentoSemMatch } from "@/lib/email";

type CaktoWebhookBody = {
  event: string;
  secret: string;
  data: {
    amount: number;
    paymentMethodName: string;
    paidAt: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
  };
};

function apenasDigitos(v: string | null | undefined) {
  return (v ?? "").replace(/\D/g, "");
}

export async function POST(request: Request) {
  const body = (await request.json()) as CaktoWebhookBody;

  if (!process.env.CAKTO_WEBHOOK_SECRET || body.secret !== process.env.CAKTO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (body.event !== "purchase_approved") {
    return NextResponse.json({ ignorado: body.event });
  }

  const { customer, amount, paymentMethodName, paidAt } = body.data;
  const telefoneDigitos = apenasDigitos(customer.phone);
  const sufixoTelefone = telefoneDigitos.slice(-8);

  const clientes = await prisma.cliente.findMany({
    where: {
      OR: [
        { email: customer.email || undefined },
        sufixoTelefone ? { whatsapp: { contains: sufixoTelefone } } : undefined,
      ].filter((c): c is NonNullable<typeof c> => Boolean(c)),
    },
  });
  const cliente = clientes[0];

  if (!cliente) {
    await sendPagamentoSemMatch({
      nome: customer.name,
      email: customer.email,
      telefone: customer.phone,
      valor: amount,
    });
    await prisma.activityLog.create({
      data: {
        tipo: "pagamento_sem_match",
        descricao: `Pagamento de ${customer.name} (${customer.email}) não encontrou cliente correspondente`,
        entidadeTipo: "pagamento",
      },
    });
    return NextResponse.json({ status: "sem_match" });
  }

  const pagamentoPendente = await prisma.pagamento.findFirst({
    where: { clienteId: cliente.id, pago: false },
    orderBy: { createdAt: "desc" },
  });

  if (pagamentoPendente) {
    await prisma.pagamento.update({
      where: { id: pagamentoPendente.id },
      data: { pago: true, valor: amount, formaPagamento: paymentMethodName, data: new Date(paidAt) },
    });
  } else {
    await prisma.pagamento.create({
      data: {
        clienteId: cliente.id,
        valor: amount,
        pago: true,
        formaPagamento: paymentMethodName,
        data: new Date(paidAt),
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      tipo: "pagamento_confirmado",
      descricao: `Pagamento de '${cliente.nome}' confirmado automaticamente via Cakto`,
      entidadeTipo: "cliente",
      entidadeId: cliente.id,
    },
  });

  return NextResponse.json({ status: "ok", clienteId: cliente.id });
}
