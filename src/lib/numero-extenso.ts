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
  if (valor === 0) return "zero";

  const milhar = Math.floor(valor / 1000);
  const resto = valor % 1000;

  const partes: string[] = [];
  if (milhar > 0) partes.push(milhar === 1 ? "mil" : `${centenaPorExtenso(milhar)} mil`);
  if (resto > 0) partes.push(centenaPorExtenso(resto));

  return partes.join(" e ");
}

export function valorPorExtenso(valor: number): string {
  return `${numeroPorExtenso(valor)} ${valor === 1 ? "real" : "reais"}`;
}
