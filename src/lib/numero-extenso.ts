const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = [
  "dez", "onze", "doze", "treze", "quatorze", "quinze",
  "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function centenaPorExtenso(n: number): string {
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) {
    if (resto < 10) partes.push(UNIDADES[resto]);
    else if (resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(" e ");
}

/** Converte um valor inteiro (reais, sem centavos) para texto por extenso em português. */
export function numeroPorExtenso(valor: number): string {
  // Arredonda e usa o valor absoluto — protege contra entrada negativa/quebrada
  // (não deveria acontecer, já que o desconto é validado antes) ou não-inteira.
  const n = Math.round(Math.abs(valor));
  if (n === 0) return "zero";
  // Acima de 999 mil foge muito do alcance real de preço da Espectra — melhor
  // devolver o número puro do que arriscar gerar texto quebrado (CENTENAS só
  // cobre 0-999, então centenaPorExtenso(milhar) quebraria com milhar >= 1000).
  if (n >= 1_000_000) return String(n);

  const milhar = Math.floor(n / 1000);
  const resto = n % 1000;

  const partes: string[] = [];
  if (milhar > 0) partes.push(milhar === 1 ? "mil" : `${centenaPorExtenso(milhar)} mil`);
  if (resto > 0) partes.push(centenaPorExtenso(resto));

  return partes.join(" e ");
}

export function valorPorExtenso(valor: number): string {
  return `${numeroPorExtenso(valor)} ${valor === 1 ? "real" : "reais"}`;
}
