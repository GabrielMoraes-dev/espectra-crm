"use server";

import { prisma } from "@/lib/prisma";
import { pesquisaSatisfacaoSchema, type PesquisaSatisfacaoFormValues } from "@/lib/validations";

export async function createPesquisaSatisfacao(values: PesquisaSatisfacaoFormValues) {
  const data = pesquisaSatisfacaoSchema.parse(values);

  await prisma.cliente.findUniqueOrThrow({ where: { id: data.clienteId } });

  const pesquisa = await prisma.pesquisaSatisfacao.create({
    data: {
      clienteId: data.clienteId,
      qualidade: data.qualidade,
      comunicacao: data.comunicacao,
      prazos: data.prazos,
      atendimento: data.atendimento,
      nota: data.nota,
      comentario: data.comentario && data.comentario.trim() !== "" ? data.comentario.trim() : null,
    },
  });

  return pesquisa;
}
