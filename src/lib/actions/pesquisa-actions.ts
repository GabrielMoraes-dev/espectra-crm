"use server";

import { prisma } from "@/lib/prisma";
import { pesquisaSatisfacaoSchema, type PesquisaSatisfacaoFormValues } from "@/lib/validations";
import { getIp, verificarRateLimit } from "@/lib/rate-limit";

export async function createPesquisaSatisfacao(values: PesquisaSatisfacaoFormValues) {
  await verificarRateLimit("criar_pesquisa", await getIp(), 10, 15 * 60 * 1000);
  const data = pesquisaSatisfacaoSchema.parse(values);

  await prisma.cliente.findUniqueOrThrow({ where: { id: data.clienteId } });

  const camposComuns = {
    qualidade: data.qualidade,
    comunicacao: data.comunicacao,
    prazos: data.prazos,
    atendimento: data.atendimento,
    nota: data.nota,
    comentario: data.comentario && data.comentario.trim() !== "" ? data.comentario.trim() : null,
  };

  // Reenvio do mesmo link (ou duplo clique) atualiza a resposta existente em vez
  // de criar uma segunda pesquisa pro mesmo cliente, o que distorceria a média.
  const existente = await prisma.pesquisaSatisfacao.findFirst({ where: { clienteId: data.clienteId } });

  const pesquisa = existente
    ? await prisma.pesquisaSatisfacao.update({ where: { id: existente.id }, data: camposComuns })
    : await prisma.pesquisaSatisfacao.create({ data: { clienteId: data.clienteId, ...camposComuns } });

  return pesquisa;
}
