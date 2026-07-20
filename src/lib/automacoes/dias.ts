const MS_POR_DIA = 86_400_000;

// Diferença em dias inteiros de "de" até "ate" (padrão: agora). Positivo quando
// "ate" é no futuro em relação a "de" (ex: dias até um prazo ainda não vencido);
// negativo quando já passou (ex: dias de atraso).
export function diasEntre(de: Date, ate: Date = new Date()): number {
  return Math.floor((ate.getTime() - de.getTime()) / MS_POR_DIA);
}
