import crypto from "crypto";

// Segredo próprio (AUTOMACAO_SECRET), independente do CRON_SECRET — permite
// revogar/rotacionar o acesso das automações sem afetar os crons internos.
// Comparação em tempo constante (mesmo padrão já usado pelos webhooks da
// Cakto/Autentique), verificando o tamanho antes pra não estourar o
// `timingSafeEqual` com buffers de tamanhos diferentes.
export function validarAutomacaoAuth(request: Request): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  const token = header.slice("Bearer ".length).trim();
  const esperado = process.env.AUTOMACAO_SECRET;
  if (!esperado || !token) return false;

  const bufRecebido = Buffer.from(token);
  const bufEsperado = Buffer.from(esperado);
  if (bufRecebido.length !== bufEsperado.length) return false;

  return crypto.timingSafeEqual(bufRecebido, bufEsperado);
}
