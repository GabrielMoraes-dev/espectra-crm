import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "desconhecido";
}

export function getIpFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "desconhecido"
  );
}

/**
 * Limite genérico por IP para endpoints/ações públicas sem login. Cada chamada
 * bem-sucedida conta como uma tentativa (diferente do login, que só conta falhas).
 * Lança erro quando o limite é excedido.
 */
export async function verificarRateLimit(acao: string, ip: string, limite: number, janelaMs: number) {
  const desde = new Date(Date.now() - janelaMs);
  const tentativas = await prisma.tentativaAcaoIp.count({
    where: { acao, ip, createdAt: { gte: desde } },
  });
  if (tentativas >= limite) {
    throw new Error("Muitas tentativas vindas do seu endereço. Tente novamente mais tarde.");
  }
  await prisma.tentativaAcaoIp.create({ data: { acao, ip } });
}
