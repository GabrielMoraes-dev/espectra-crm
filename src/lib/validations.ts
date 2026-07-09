import { z } from "zod";

export const leadSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  empresa: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  origem: z.string().optional().or(z.literal("")),
  valorEstimado: z.coerce.number().nonnegative().optional().nullable(),
  observacoes: z.string().optional().or(z.literal("")),
  etapa: z.enum([
    "NOVO",
    "PRIMEIRO_CONTATO",
    "RESPONDENDO",
    "REUNIAO",
    "PROPOSTA_ENVIADA",
    "NEGOCIACAO",
    "FECHADO",
    "PERDIDO",
  ]),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  empresa: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  site: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  nicho: z.string().optional().or(z.literal("")),
  planoContratado: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().nonnegative().optional().nullable(),
  responsavelId: z.string().optional().or(z.literal("")),
  prazo: z.string().optional().or(z.literal("")),
  status: z.enum(["EM_PRODUCAO", "EM_REVISAO", "PUBLICADO", "FINALIZADO"]),
  contratoUrl: z.string().optional().or(z.literal("")),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;

export const projetoSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  prazo: z.string().optional().or(z.literal("")),
  responsavelId: z.string().optional().or(z.literal("")),
  status: z.enum(["BRIEFING", "DESIGN", "DESENVOLVIMENTO", "REVISAO", "PUBLICADO"]),
  observacoes: z.string().optional().or(z.literal("")),
});

export type ProjetoFormValues = z.infer<typeof projetoSchema>;

export const pagamentoSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  valor: z.coerce.number().positive("Informe um valor"),
  pago: z.boolean(),
  formaPagamento: z.string().optional().or(z.literal("")),
  data: z.string().optional().or(z.literal("")),
});

export type PagamentoFormValues = z.infer<typeof pagamentoSchema>;

export const tarefaSchema = z.object({
  titulo: z.string().min(2, "Informe o título"),
  descricao: z.string().optional().or(z.literal("")),
  responsavelId: z.string().optional().or(z.literal("")),
  prazo: z.string().optional().or(z.literal("")),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA"]),
  status: z.enum(["A_FAZER", "EM_ANDAMENTO", "CONCLUIDA"]),
});

export type TarefaFormValues = z.infer<typeof tarefaSchema>;

export const membroSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  cargo: z.string().min(2, "Informe o cargo"),
  telefone: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  foto: z.string().optional().or(z.literal("")),
  responsabilidades: z.array(z.string()),
});

export type MembroFormValues = z.infer<typeof membroSchema>;

export const sopSchema = z.object({
  conteudo: z.string().optional().or(z.literal("")),
});

export type SOPFormValues = z.infer<typeof sopSchema>;

export const linkInternoSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  url: z.string().min(1, "Informe a URL"),
});

export type LinkInternoFormValues = z.infer<typeof linkInternoSchema>;

export const configuracaoSchema = z.object({
  nomeEmpresa: z.string().min(1, "Informe o nome da empresa"),
  logoUrl: z.string().optional().or(z.literal("")),
  sobre: z.string().optional().or(z.literal("")),
});

export type ConfiguracaoFormValues = z.infer<typeof configuracaoSchema>;

export const timelineEventSchema = z.object({
  titulo: z.string().min(2, "Informe o título"),
  descricao: z.string().optional().or(z.literal("")),
});

export type TimelineEventValues = z.infer<typeof timelineEventSchema>;

export const convertLeadSchema = z.object({
  nicho: z.string().optional().or(z.literal("")),
  planoContratado: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().nonnegative().optional().nullable(),
  responsavelId: z.string().optional().or(z.literal("")),
});

export type ConvertLeadValues = z.infer<typeof convertLeadSchema>;

export const briefingSchema = z.object({
  leadId: z.string().optional().or(z.literal("")),
  clienteId: z.string().optional().or(z.literal("")),

  nome: z.string().min(2, "Informe o nome"),
  profissao: z.string().min(2, "Informe a profissão"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
  whatsapp: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um WhatsApp válido, com DDD"),
  instagram: z.string().optional().or(z.literal("")),
  cpfCnpj: z.string().min(1, "Informe o CPF/CNPJ"),
  registroProfissional: z.string().optional().or(z.literal("")),

  apresentacao: z.string().min(1, "Campo obrigatório"),
  historia: z.string().min(1, "Campo obrigatório"),
  especialidades: z.string().min(1, "Campo obrigatório"),
  numeroDestaque: z.string().optional().or(z.literal("")),

  diferenciais: z.string().min(1, "Campo obrigatório"),
  motivoProcura: z.string().min(1, "Campo obrigatório"),
  servicos: z.string().min(1, "Campo obrigatório"),
  atendimento: z.string().min(1, "Campo obrigatório"),
  ondeAtende: z.string().optional().or(z.literal("")),
  enderecoFisico: z.string().optional().or(z.literal("")),
  valoresServicos: z.string().optional().or(z.literal("")),
  faqAgendamento: z.string().optional().or(z.literal("")),
  faqAntesConsulta: z.string().optional().or(z.literal("")),
  faqCancelamento: z.string().optional().or(z.literal("")),
  faqHorarios: z.string().optional().or(z.literal("")),

  depoimentosUrls: z.array(z.string()).optional(),
  fotosUrls: z.array(z.string()).optional(),
  arquivosGeraisUrls: z.array(z.string()).optional(),
});

export type BriefingFormValues = z.infer<typeof briefingSchema>;

export const briefingInicialSchema = z.object({
  leadId: z.string().min(1),
  nome: z.string().min(2, "Informe o nome"),
  profissao: z.string().min(2, "Informe a profissão"),
  apresentacao: z.string().min(1, "Campo obrigatório"),
  fotosUrls: z
    .array(z.string())
    .min(1, "Envie ao menos uma foto ou logo")
    .max(6, "Envie no máximo 6 fotos"),
});

export type BriefingInicialFormValues = z.infer<typeof briefingInicialSchema>;

export const pesquisaSatisfacaoSchema = z.object({
  clienteId: z.string().min(1),
  qualidade: z.coerce.number().int().min(1).max(5),
  comunicacao: z.coerce.number().int().min(1).max(5),
  prazos: z.coerce.number().int().min(1).max(5),
  atendimento: z.coerce.number().int().min(1).max(5),
  nota: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional().or(z.literal("")),
});

export type PesquisaSatisfacaoFormValues = z.infer<typeof pesquisaSatisfacaoSchema>;
