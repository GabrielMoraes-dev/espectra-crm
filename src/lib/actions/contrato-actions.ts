"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { enviarContratoParaAssinatura } from "@/lib/autentique";
import { formatCurrency } from "@/lib/utils";
import { valorPorExtenso } from "@/lib/numero-extenso";
import { CAKTO_LINKS_POR_PRECO } from "@/lib/constants";

export async function enviarContrato(clienteId: string, preco: number, desconto?: number) {
  await requireAuth();

  if (!CAKTO_LINKS_POR_PRECO[preco]) throw new Error("Preço inválido");

  const cliente = await prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } });
  if (!cliente.email) throw new Error("O cliente precisa ter um email cadastrado");
  if (!cliente.cpfCnpj) throw new Error("O cliente ainda não enviou o CPF/CNPJ pelo briefing");

  const clienteCidadeUf = [cliente.cidade, cliente.estado].filter(Boolean).join("/") || "—";
  const valor = desconto ? Math.round(preco * (1 - desconto / 100)) : preco;

  const docId = await enviarContratoParaAssinatura({
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    clienteEmail: cliente.email,
    clienteCpfCnpj: cliente.cpfCnpj,
    clienteCidadeUf,
    precoFormatado: formatCurrency(preco).replace("R$", "").trim(),
    desconto,
    valorFormatado: formatCurrency(valor).replace("R$", "").trim(),
    valorExtenso: valorPorExtenso(valor),
  });

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { contratoAutentiqueId: docId, valor },
  });

  await prisma.timelineEvent.create({
    data: {
      clienteId,
      titulo: "Contrato enviado para assinatura",
      descricao: `Enviado para ${cliente.email} via Autentique.`,
    },
  });

  revalidatePath(`/clientes/${clienteId}`);
}
