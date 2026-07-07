"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { enviarContratoParaAssinatura } from "@/lib/autentique";
import { formatCurrency } from "@/lib/utils";
import { CAKTO_LINKS_POR_PRECO, VALOR_EXTENSO_POR_PRECO } from "@/lib/constants";

export async function enviarContrato(clienteId: string, valor: number) {
  await requireAuth();

  if (!CAKTO_LINKS_POR_PRECO[valor]) throw new Error("Preço inválido");

  const cliente = await prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } });
  if (!cliente.email) throw new Error("O cliente precisa ter um email cadastrado");
  if (!cliente.cpfCnpj) throw new Error("O cliente ainda não enviou o CPF/CNPJ pelo briefing");

  const clienteCidadeUf = [cliente.cidade, cliente.estado].filter(Boolean).join("/") || "—";

  const docId = await enviarContratoParaAssinatura({
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    clienteEmail: cliente.email,
    clienteCpfCnpj: cliente.cpfCnpj,
    clienteCidadeUf,
    valorFormatado: formatCurrency(valor).replace("R$", "").trim(),
    valorExtenso: VALOR_EXTENSO_POR_PRECO[valor],
  });

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { contratoAutentiqueId: docId },
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
