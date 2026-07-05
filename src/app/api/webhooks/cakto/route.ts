import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPagamentoSemMatch } from "@/lib/email";

type CaktoWebhookItem = {
  amount: number;
  offer_type: string;
  paymentMethodName: string;
  paidAt: string;
  sck: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

type CaktoWebhookBody = {
  event: string;
  secret: string;
  data: CaktoWebhookItem[];
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

  const itens = body.data;
  const itemPrincipal = itens.find((i) => i.offer_type === "main") ?? itens[0];
  const { customer, paymentMethodName, paidAt, sck } = itemPrincipal;
  const valorTotal = itens.reduce((soma, i) => soma + i.amount, 0);

  let cliente = sck ? await prisma.cliente.findUnique({ where: { id: sck } }) : null;

  if (!cliente) {
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
    cliente = clientes[0] ?? null;
  }

  if (!cliente) {
    await sendPagamentoSemMatch({
      nome: customer.name,
      email: customer.email,
      telefone: customer.phone,
      valor: valorTotal,
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
      data: { pago: true, valor: valorTotal, formaPagamento: paymentMethodName, data: new Date(paidAt) },
    });
  } else {
    await prisma.pagamento.create({
      data: {
        clienteId: cliente.id,
        valor: valorTotal,
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
