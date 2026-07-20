export class ParametroInvalidoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ParametroInvalidoError";
  }
}

export const LIMITE_PADRAO = 50;
export const LIMITE_MAXIMO = 200;

// Tag opcional (?consumidor=openclaw, ?rotina=resumo-diario) usada só pra
// identificar quem está chamando na auditoria — nunca vira condição de acesso,
// então um valor fora do formato esperado é ignorado silenciosamente em vez de
// derrubar a consulta.
const IDENTIFICADOR_REGEX = /^[a-zA-Z0-9_-]{1,40}$/;

export function parseIdentificadorOpcional(valor: string | null): string | null {
  if (!valor) return null;
  return IDENTIFICADOR_REGEX.test(valor) ? valor : null;
}

export function parseLimite(valor: string | null): number {
  if (!valor) return LIMITE_PADRAO;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) {
    throw new ParametroInvalidoError("Parâmetro 'limite' deve ser um inteiro positivo.");
  }
  return Math.min(n, LIMITE_MAXIMO);
}

// new Date("qualquer texto que o motor JS reconheça") aceita formatos bem além
// de ISO 8601 (e de forma inconsistente entre engines) — a checagem de formato
// abaixo garante que só ISO 8601 de verdade passa, como o contrato promete.
// Mês 01-12, hora 00-23, minuto/segundo 00-59 já ficam de fora aqui; dia
// específico do mês (ex: 30 de fevereiro) o regex sozinho não sabe validar —
// isso é checado logo abaixo com Date.UTC, porque new Date() normaliza uma
// data-calendário inexistente em vez de rejeitá-la (2026-02-30 vira
// 2026-03-02 silenciosamente).
const ISO_8601_REGEX =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?)?$/;

export function parseData(valor: string | null, nomeParam: string): Date | undefined {
  if (!valor) return undefined;
  const match = ISO_8601_REGEX.exec(valor);
  if (!match) {
    throw new ParametroInvalidoError(`Parâmetro '${nomeParam}' deve ser uma data ISO 8601 válida.`);
  }

  // Valida que ano-mês-dia formam uma data de calendário real (independente
  // do horário/fuso que vier depois) — Date.UTC(2026, 1, 30) normaliza pra
  // 2 de março, então comparar os componentes de volta detecta a diferença.
  const [, anoStr, mesStr, diaStr] = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)!;
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  const dia = Number(diaStr);
  const dataCalendario = new Date(Date.UTC(ano, mes - 1, dia));
  const calendarioValido =
    dataCalendario.getUTCFullYear() === ano &&
    dataCalendario.getUTCMonth() + 1 === mes &&
    dataCalendario.getUTCDate() === dia;

  const d = new Date(valor);
  if (!calendarioValido || Number.isNaN(d.getTime())) {
    throw new ParametroInvalidoError(`Parâmetro '${nomeParam}' deve ser uma data ISO 8601 válida.`);
  }
  return d;
}

// Rejeita intervalos invertidos (ex: inicio >= fim) com 400 em vez de devolver
// silenciosamente uma lista vazia que parece um resultado válido pra um agente.
export function validarIntervalo(inicio: Date | undefined, fim: Date | undefined, nomeInicio: string, nomeFim: string) {
  if (inicio && fim && inicio >= fim) {
    throw new ParametroInvalidoError(`Parâmetro '${nomeInicio}' deve ser anterior a '${nomeFim}'.`);
  }
}

export function parseInteiroOpcional(valor: string | null, nomeParam: string): number | undefined {
  if (valor == null) return undefined;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0) {
    throw new ParametroInvalidoError(`Parâmetro '${nomeParam}' deve ser um inteiro não-negativo.`);
  }
  return n;
}

export function parseBooleano(valor: string | null, nomeParam: string): boolean | undefined {
  if (valor == null) return undefined;
  if (valor === "true") return true;
  if (valor === "false") return false;
  throw new ParametroInvalidoError(`Parâmetro '${nomeParam}' deve ser 'true' ou 'false'.`);
}

export function parseEnumOpcional<T extends string>(
  valor: string | null,
  valoresValidos: readonly T[],
  nomeParam: string,
): T | undefined {
  if (!valor) return undefined;
  if (!valoresValidos.includes(valor as T)) {
    throw new ParametroInvalidoError(
      `Parâmetro '${nomeParam}' inválido. Valores aceitos: ${valoresValidos.join(", ")}.`,
    );
  }
  return valor as T;
}
