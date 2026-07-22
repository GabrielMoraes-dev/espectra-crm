import {
  LayoutDashboard,
  Inbox,
  Users,
  Rocket,
  Wallet,
  CheckSquare,
  Map,
  Network,
  FileText,
  Settings,
  History,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Inbox },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Projetos", href: "/projetos", icon: Rocket },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { label: "Mapa", href: "/mapa", icon: Map },
  { label: "Estrutura Operacional", href: "/estrutura-operacional", icon: Network },
  { label: "Modelos", href: "/modelos", icon: FileText },
  { label: "Atividades", href: "/atividades", icon: History },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

// Reserved id used by the read-only "Modelos" preview pages — never a real Lead/Cliente id.
export const DEMO_ID = "modelo";

// ---------- Leads ----------

export const ETAPA_LEAD_ORDEM = [
  "NOVO",
  "PRIMEIRO_CONTATO",
  "RESPONDENDO",
  "REUNIAO",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "FECHADO",
  "PERDIDO",
] as const;

export const ETAPA_LEAD_CONFIG: Record<
  (typeof ETAPA_LEAD_ORDEM)[number],
  { label: string; className: string }
> = {
  NOVO: { label: "Novo", className: "bg-secondary text-secondary-foreground" },
  PRIMEIRO_CONTATO: { label: "Primeiro contato", className: "bg-accent text-accent-foreground" },
  RESPONDENDO: { label: "Respondendo", className: "bg-accent text-accent-foreground" },
  REUNIAO: { label: "Reunião", className: "bg-brand-500/25 text-brand-100" },
  PROPOSTA_ENVIADA: { label: "Proposta enviada", className: "bg-brand-500/35 text-brand-100" },
  NEGOCIACAO: { label: "Negociação", className: "bg-warning/20 text-warning" },
  FECHADO: { label: "Fechado", className: "bg-success/20 text-success" },
  PERDIDO: { label: "Perdido", className: "bg-danger/20 text-danger" },
};

export const TIPO_INTERACAO_LEAD_ORDEM = [
  "WHATSAPP",
  "LIGACAO",
  "REUNIAO",
  "AMOSTRA_ENVIADA",
  "PROPOSTA_ENVIADA",
  "OUTRO",
] as const;

export const TIPO_INTERACAO_LEAD_CONFIG: Record<
  (typeof TIPO_INTERACAO_LEAD_ORDEM)[number],
  { label: string }
> = {
  WHATSAPP: { label: "WhatsApp" },
  LIGACAO: { label: "Ligação" },
  REUNIAO: { label: "Reunião" },
  AMOSTRA_ENVIADA: { label: "Amostra enviada" },
  PROPOSTA_ENVIADA: { label: "Proposta enviada" },
  OUTRO: { label: "Outro contato" },
};

// ---------- Clientes ----------

export const STATUS_CLIENTE_CONFIG = {
  EM_PRODUCAO: { label: "Em produção", className: "bg-warning/20 text-warning" },
  EM_REVISAO: { label: "Em revisão", className: "bg-brand-500/30 text-brand-100" },
  PUBLICADO: { label: "Publicado", className: "bg-success/20 text-success" },
  FINALIZADO: { label: "Finalizado", className: "bg-secondary text-secondary-foreground" },
} as const;

// ---------- Financeiro ----------

export const FORMAS_PAGAMENTO = [
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Boleto",
  "Transferência",
  "Dinheiro",
  "Outro",
] as const;

// ---------- Projetos ----------

export const ETAPA_PROJETO_ORDEM = [
  "BRIEFING",
  "DESIGN",
  "DESENVOLVIMENTO",
  "REVISAO",
  "PUBLICADO",
] as const;

export const ETAPA_PROJETO_CONFIG: Record<
  (typeof ETAPA_PROJETO_ORDEM)[number],
  { label: string; className: string }
> = {
  BRIEFING: { label: "Briefing", className: "bg-secondary text-secondary-foreground" },
  DESIGN: { label: "Design", className: "bg-accent text-accent-foreground" },
  DESENVOLVIMENTO: { label: "Desenvolvimento", className: "bg-brand-500/30 text-brand-100" },
  REVISAO: { label: "Revisão", className: "bg-warning/20 text-warning" },
  PUBLICADO: { label: "Publicado", className: "bg-success/20 text-success" },
};

// Checklist padrão por etapa do projeto — só um rascunho inicial, dá pra
// ajustar os itens aqui conforme o processo real da Espectra for mudando.
export const CHECKLIST_ETAPA_PROJETO: Record<
  (typeof ETAPA_PROJETO_ORDEM)[number],
  { id: string; label: string }[]
> = {
  BRIEFING: [
    { id: "briefing-recebido", label: "Briefing completo recebido" },
    { id: "contrato-enviado", label: "Contrato enviado pra assinatura" },
    { id: "pagamento-confirmado", label: "Pagamento confirmado" },
  ],
  DESIGN: [
    { id: "identidade-definida", label: "Paleta de cores e identidade definidas" },
    { id: "estrutura-aprovada", label: "Estrutura/wireframe aprovado" },
    { id: "copy-revisado", label: "Copy revisado" },
  ],
  DESENVOLVIMENTO: [
    { id: "landing-implementada", label: "Landing page implementada" },
    { id: "dominio-configurado", label: "Domínio configurado" },
    { id: "testado-mobile", label: "Testado em celular e computador" },
  ],
  REVISAO: [
    { id: "ajustes-aplicados", label: "Ajustes do cliente aplicados" },
    { id: "aprovacao-final", label: "Aprovação final do cliente" },
  ],
  PUBLICADO: [
    { id: "site-no-ar", label: "Site no ar" },
    { id: "cliente-avisado", label: "Cliente avisado" },
    { id: "pesquisa-enviada", label: "Pesquisa de satisfação enviada" },
  ],
};

// ---------- Tarefas ----------

export const PRIORIDADE_TAREFA_CONFIG = {
  BAIXA: { label: "Baixa", className: "bg-secondary text-secondary-foreground" },
  MEDIA: { label: "Média", className: "bg-warning/20 text-warning" },
  ALTA: { label: "Alta", className: "bg-danger/20 text-danger" },
} as const;

export const STATUS_TAREFA_CONFIG = {
  A_FAZER: { label: "A fazer", className: "bg-secondary text-secondary-foreground" },
  EM_ANDAMENTO: { label: "Em andamento", className: "bg-brand-500/30 text-brand-100" },
  CONCLUIDA: { label: "Concluída", className: "bg-success/20 text-success" },
} as const;

export const STATUS_TAREFA_ORDEM = ["A_FAZER", "EM_ANDAMENTO", "CONCLUIDA"] as const;

// ---------- Origem de leads (sugestões) ----------

export const ORIGENS_LEAD = [
  "Instagram",
  "Indicação",
  "WhatsApp",
  "Site",
  "Prospecção ativa",
  "Outro",
];

export const NICHOS_CLIENTE = [
  "Médico(a)",
  "Dentista",
  "Nutricionista",
  "Psicólogo(a)",
  "Advogado(a)",
  "Consultor(a)",
  "Mentor(a)",
  "Infoprodutor(a)",
  "Outro",
];

export const CAKTO_LINKS_POR_PRECO: Record<number, string> = {
  297: "https://pay.cakto.com.br/3akkm9p_963891",
  397: "https://pay.cakto.com.br/n86tfrx",
  497: "https://pay.cakto.com.br/k98za5w",
  597: "https://pay.cakto.com.br/fyhiwzc",
  697: "https://pay.cakto.com.br/nzjpcpy",
  797: "https://pay.cakto.com.br/37pf7ph",
  897: "https://pay.cakto.com.br/36c5kpk",
  997: "https://pay.cakto.com.br/ddefprf",
};

// Cupons "desconto5", "desconto10"... já criados no produto da Cakto (percentual embutido no código)
export const DESCONTOS_DISPONIVEIS = [5, 10, 15, 20, 25, 30] as const;

export const ESTADOS_BRASIL = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

// ---------- Estrutura Operacional ----------

export const CARGO_INDICATOR: Record<string, string> = {
  "Produto, Design e Entrega": "Produção e entrega",
  "Estratégia, Comercial e Tecnologia": "Estratégia e crescimento",
};

export const FLUXO_OPERACIONAL = [
  "Prospect",
  "DM",
  "Negociação",
  "Cliente",
  "Briefing",
  "Copy",
  "Landing",
  "Pack de Artes",
  "Ajustes",
  "Entrega",
  "Depoimento",
];

export const LINK_ICON_MAP: Record<string, string> = {
  github: "Code2",
  triangle: "Triangle",
  figma: "PenTool",
  "hard-drive": "HardDrive",
  notebook: "NotebookText",
  palette: "Palette",
  "file-text": "FileText",
};
