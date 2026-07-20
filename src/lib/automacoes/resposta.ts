import { NextResponse } from "next/server";
import { ParametroInvalidoError } from "@/lib/automacoes/parsing";

export const VERSAO_API = "1.0";

// Resposta autenticada de dado operacional — nunca deve ser cacheada por um
// proxy/CDN compartilhado.
const HEADERS_PADRAO = { "Cache-Control": "private, no-store" };

export function respostaSucesso(dados: unknown, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    {
      sucesso: true,
      versao: VERSAO_API,
      geradoEm: new Date().toISOString(),
      ...extra,
      dados,
    },
    { headers: HEADERS_PADRAO },
  );
}

type ErroCodigo = "NAO_AUTORIZADO" | "PARAMETRO_INVALIDO" | "ERRO_INTERNO";

const STATUS_POR_CODIGO: Record<ErroCodigo, number> = {
  NAO_AUTORIZADO: 401,
  PARAMETRO_INVALIDO: 400,
  ERRO_INTERNO: 500,
};

export function respostaErro(codigo: ErroCodigo, mensagem: string) {
  return NextResponse.json(
    { sucesso: false, erro: { codigo, mensagem } },
    { status: STATUS_POR_CODIGO[codigo], headers: HEADERS_PADRAO },
  );
}

// Converte qualquer erro lançado dentro de uma rota numa resposta padronizada —
// nunca repassa stack trace nem mensagem crua do Prisma pro consumidor externo.
export function respostaDeErro(erro: unknown) {
  if (erro instanceof ParametroInvalidoError) {
    return respostaErro("PARAMETRO_INVALIDO", erro.message);
  }
  console.error("[automacoes]", erro);
  return respostaErro("ERRO_INTERNO", "Erro interno. Tente novamente.");
}
