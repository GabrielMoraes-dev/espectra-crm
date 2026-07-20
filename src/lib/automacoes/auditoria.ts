import { prisma } from "@/lib/prisma";

// Única escrita permitida por essa camada: um rastro técnico da própria
// consulta (nunca token, header, query completa ou dado pessoal). Best-effort
// de propósito — se a gravação falhar, não deve derrubar uma leitura válida,
// então o erro só vai pro console, nunca propaga pro caller.
export async function registrarAuditoria(params: {
  endpoint: string;
  consumidor: string | null;
  rotina: string | null;
  sucesso: boolean;
  totalRegistros?: number;
  duracaoMs: number;
}) {
  try {
    const partes = [
      `endpoint=${params.endpoint}`,
      params.consumidor ? `consumidor=${params.consumidor}` : null,
      params.rotina ? `rotina=${params.rotina}` : null,
      `sucesso=${params.sucesso}`,
      params.totalRegistros != null ? `registros=${params.totalRegistros}` : null,
      `duracaoMs=${params.duracaoMs}`,
    ].filter((parte): parte is string => parte !== null);

    await prisma.activityLog.create({
      data: {
        tipo: "automacao_consulta",
        descricao: partes.join(" "),
        entidadeTipo: "automacao",
        entidadeId: params.endpoint,
      },
    });
  } catch (erro) {
    console.error("[automacoes] falha ao registrar auditoria", erro);
  }
}
