-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EtapaLead" AS ENUM ('NOVO', 'PRIMEIRO_CONTATO', 'RESPONDENDO', 'REUNIAO', 'PROPOSTA_ENVIADA', 'NEGOCIACAO', 'FECHADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('EM_PRODUCAO', 'EM_REVISAO', 'PUBLICADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EtapaProjeto" AS ENUM ('BRIEFING', 'DESIGN', 'DESENVOLVIMENTO', 'REVISAO', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateTable
CREATE TABLE "MembroEquipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "foto" TEXT,
    "responsabilidades" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembroEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tentativasFalhas" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoAte" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativaLoginIp" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaLoginIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativaAcaoIp" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaAcaoIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresa" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "email" TEXT,
    "origem" TEXT,
    "valorEstimado" DOUBLE PRECISION,
    "observacoes" TEXT,
    "etapa" "EtapaLead" NOT NULL DEFAULT 'NOVO',
    "clienteId" TEXT,
    "linkCopiadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingInicial" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "profissao" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apresentacao" TEXT NOT NULL,
    "fotosUrls" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefingInicial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresa" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "email" TEXT,
    "site" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "nicho" TEXT,
    "planoContratado" TEXT,
    "valor" DOUBLE PRECISION,
    "contratoUrl" TEXT,
    "contratoAutentiqueId" TEXT,
    "cpfCnpj" TEXT,
    "responsavelId" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazo" TIMESTAMP(3),
    "status" "StatusCliente" NOT NULL DEFAULT 'EM_PRODUCAO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "clienteId" TEXT,
    "nome" TEXT NOT NULL,
    "profissao" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "instagram" TEXT,
    "cpfCnpj" TEXT,
    "registroProfissional" TEXT,
    "apresentacao" TEXT NOT NULL,
    "historia" TEXT NOT NULL,
    "especialidades" TEXT NOT NULL,
    "numeroDestaque" TEXT,
    "diferenciais" TEXT NOT NULL,
    "motivoProcura" TEXT NOT NULL,
    "servicos" TEXT NOT NULL,
    "atendimento" TEXT NOT NULL,
    "ondeAtende" TEXT,
    "enderecoFisico" TEXT,
    "valoresServicos" TEXT,
    "dominio" TEXT,
    "faqAgendamento" TEXT,
    "faqAntesConsulta" TEXT,
    "faqCancelamento" TEXT,
    "faqHorarios" TEXT,
    "objetivo" TEXT,
    "cta" TEXT,
    "depoimentosUrls" TEXT,
    "fotosUrls" TEXT,
    "arquivosGeraisUrls" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "prazo" TIMESTAMP(3),
    "responsavelId" TEXT,
    "status" "EtapaProjeto" NOT NULL DEFAULT 'BRIEFING',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "formaPagamento" TEXT,
    "desconto" INTEGER,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesquisaSatisfacao" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "qualidade" INTEGER NOT NULL,
    "comunicacao" INTEGER NOT NULL,
    "prazos" INTEGER NOT NULL,
    "atendimento" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PesquisaSatisfacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoSemMatch" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoSemMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelId" TEXT,
    "clienteId" TEXT,
    "prazo" TIMESTAMP(3),
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusTarefa" NOT NULL DEFAULT 'A_FAZER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOP" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "conteudo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkInterno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icone" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkInterno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoEmpresa" (
    "id" TEXT NOT NULL,
    "nomeEmpresa" TEXT NOT NULL DEFAULT 'Espectra',
    "logoUrl" TEXT,
    "sobre" TEXT,
    "tema" TEXT NOT NULL DEFAULT 'dark-navy',

    CONSTRAINT "ConfiguracaoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "entidadeTipo" TEXT,
    "entidadeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "TentativaLoginIp_ip_createdAt_idx" ON "TentativaLoginIp"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "TentativaAcaoIp_acao_ip_createdAt_idx" ON "TentativaAcaoIp"("acao", "ip", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_clienteId_key" ON "Lead"("clienteId");

-- CreateIndex
CREATE INDEX "BriefingInicial_leadId_idx" ON "BriefingInicial"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_contratoAutentiqueId_key" ON "Cliente"("contratoAutentiqueId");

-- CreateIndex
CREATE INDEX "Cliente_responsavelId_idx" ON "Cliente"("responsavelId");

-- CreateIndex
CREATE INDEX "FotoCliente_clienteId_idx" ON "FotoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "Briefing_leadId_idx" ON "Briefing"("leadId");

-- CreateIndex
CREATE INDEX "Briefing_clienteId_idx" ON "Briefing"("clienteId");

-- CreateIndex
CREATE INDEX "TimelineEvent_clienteId_idx" ON "TimelineEvent"("clienteId");

-- CreateIndex
CREATE INDEX "Projeto_clienteId_idx" ON "Projeto"("clienteId");

-- CreateIndex
CREATE INDEX "Projeto_responsavelId_idx" ON "Projeto"("responsavelId");

-- CreateIndex
CREATE INDEX "Pagamento_clienteId_idx" ON "Pagamento"("clienteId");

-- CreateIndex
CREATE INDEX "PesquisaSatisfacao_clienteId_idx" ON "PesquisaSatisfacao"("clienteId");

-- CreateIndex
CREATE INDEX "Tarefa_responsavelId_idx" ON "Tarefa"("responsavelId");

-- CreateIndex
CREATE INDEX "Tarefa_clienteId_idx" ON "Tarefa"("clienteId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingInicial" ADD CONSTRAINT "BriefingInicial_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "MembroEquipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoCliente" ADD CONSTRAINT "FotoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "MembroEquipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesquisaSatisfacao" ADD CONSTRAINT "PesquisaSatisfacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "MembroEquipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

