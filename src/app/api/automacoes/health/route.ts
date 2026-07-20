import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAutomacaoAuth } from "@/lib/automacoes/auth";
import { respostaSucesso, respostaErro } from "@/lib/automacoes/resposta";
import { parseIdentificadorOpcional } from "@/lib/automacoes/parsing";
import { registrarAuditoria } from "@/lib/automacoes/auditoria";

export async function GET(request: NextRequest) {
  const inicio = Date.now();
  const sp = request.nextUrl.searchParams;
  const consumidor = parseIdentificadorOpcional(sp.get("consumidor"));
  const rotina = parseIdentificadorOpcional(sp.get("rotina"));
  const endpoint = "health";

  // Auditoria só começa DEPOIS da autenticação válida — ver mesmo comentário
  // nos outros endpoints.
  if (!validarAutomacaoAuth(request)) {
    return respostaErro("NAO_AUTORIZADO", "Não autorizado.");
  }

  let bancoConectado = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    bancoConectado = false;
  }

  const ambiente = process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");

  await registrarAuditoria({ endpoint, consumidor, rotina, sucesso: true, duracaoMs: Date.now() - inicio });

  return respostaSucesso({
    status: bancoConectado ? "ok" : "degradado",
    bancoConectado,
    ambiente,
  });
}
