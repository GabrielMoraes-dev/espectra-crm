export type CategoriaEvento = "comercial" | "financeiro" | "operacional" | "sistema" | "outro";

// Mapa construído a partir de todo `activityLog.create({ tipo: "..." })` real
// hoje no código (grep, não suposição). ActivityLog.tipo é string livre, sem
// enum no schema — tipos futuros que não estiverem aqui caem no fallback
// "outro" em vez de quebrar a normalização.
//
// Limitação conhecida: "projeto" cobre tanto "projeto criado" quanto "projeto
// mudou de etapa" (mesmo tipo pras duas ações); "tarefa" cobre tanto "criada"
// quanto "concluída" — o texto de `descricao` distingue os dois casos, mas
// como esse texto é considerado não-confiável (pode conter dado pessoal
// digitado em observações no futuro), a API não tenta separar os dois eventos
// e usa um resumo genérico pra ambos.
export const EVENTO_LABELS: Record<string, { categoria: CategoriaEvento; resumo: string }> = {
  lead_criado: { categoria: "comercial", resumo: "Novo lead cadastrado" },
  lead_etapa: { categoria: "comercial", resumo: "Lead mudou de etapa" },
  lead_perdido: { categoria: "comercial", resumo: "Lead marcado como perdido" },
  lead_interacao: { categoria: "comercial", resumo: "Interação registrada com lead" },
  cliente_criado: { categoria: "comercial", resumo: "Novo cliente" },
  cliente_status: { categoria: "comercial", resumo: "Cliente mudou de status" },
  contrato_assinado: { categoria: "comercial", resumo: "Contrato assinado" },
  briefing_recebido: { categoria: "operacional", resumo: "Briefing completo recebido" },
  briefing_inicial_recebido: { categoria: "operacional", resumo: "Briefing inicial recebido" },
  pagamento_confirmado: { categoria: "financeiro", resumo: "Pagamento confirmado" },
  pagamento_sem_match: { categoria: "financeiro", resumo: "Pagamento sem cliente identificado" },
  pagamento: { categoria: "financeiro", resumo: "Pagamento registrado" },
  projeto: { categoria: "operacional", resumo: "Atualização de projeto" },
  tarefa: { categoria: "operacional", resumo: "Atualização de tarefa" },
  webhook_erro: { categoria: "operacional", resumo: "Erro em integração externa" },
  email_falhou: { categoria: "operacional", resumo: "Falha ao enviar e-mail" },
  login: { categoria: "sistema", resumo: "Login no CRM" },
  logout: { categoria: "sistema", resumo: "Logout do CRM" },
};

export function normalizarEvento(tipo: string) {
  return EVENTO_LABELS[tipo] ?? { categoria: "outro" as const, resumo: `Evento: ${tipo}` };
}
