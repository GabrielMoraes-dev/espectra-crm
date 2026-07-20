// Mesma constante já usada em email.ts pros links dos e-mails automáticos.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://espectra-crm.vercel.app";

// Só Cliente tem página própria por id (/clientes/[id]) hoje — Leads, Projetos
// e Tarefas são Kanban/lista com um painel client-side, sem rota própria por
// registro. Por isso "link do registro" só existe de fato pro Cliente; os
// outros recebem o link da lista (ou do Cliente relacionado, quando houver).
export function linkListaLeads() {
  return `${SITE_URL}/leads`;
}

export function linkListaProjetos() {
  return `${SITE_URL}/projetos`;
}

export function linkListaTarefas() {
  return `${SITE_URL}/tarefas`;
}

export function linkCliente(clienteId: string) {
  return `${SITE_URL}/clientes/${clienteId}`;
}
