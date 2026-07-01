import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  return daysAgo(-n);
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.activityLog.deleteMany();
  await prisma.linkInterno.deleteMany();
  await prisma.sOP.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.projeto.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.membroEquipe.deleteMany();
  await prisma.configuracaoEmpresa.deleteMany();

  console.log("Criando equipe...");
  const arquiteto = await prisma.membroEquipe.create({
    data: {
      nome: "Lucas Andrade",
      cargo: "Arquiteto",
      telefone: "(11) 98221-4032",
      email: "lucas@espectra.com",
      responsabilidades: JSON.stringify([
        "Pesquisa dos prospects",
        "Landing Pages",
        "Copywriting",
        "Desenvolvimento",
        "Pack de Artes",
        "Ajustes",
      ]),
    },
  });

  const closer = await prisma.membroEquipe.create({
    data: {
      nome: "Rafael Souza",
      cargo: "Closer",
      telefone: "(11) 97734-1190",
      email: "rafael@espectra.com",
      responsabilidades: JSON.stringify([
        "DMs",
        "Conversas",
        "Negociação",
        "Fechamento",
        "Upsell",
        "Follow-up",
        "Gestão dos clientes",
        "Feedbacks",
      ]),
    },
  });

  const membros = [arquiteto, closer];

  console.log("Criando clientes...");
  const clientesSeed = [
    { nome: "Marina Costa", empresa: "Estúdio Bella Pele", nicho: "Saúde e Estética", status: "PUBLICADO", valor: 2400 },
    { nome: "Henrique Lima", empresa: "Lima Advocacia", nicho: "Advocacia", status: "FINALIZADO", valor: 3800 },
    { nome: "Fernanda Alves", empresa: "Alves Imóveis", nicho: "Imobiliário", status: "EM_REVISAO", valor: 3200 },
    { nome: "Bruno Tavares", empresa: "Método Tavares", nicho: "Infoprodutos", status: "EM_PRODUCAO", valor: 4500 },
    { nome: "Camila Ribeiro", empresa: "Ribeiro Odontologia", nicho: "Saúde e Estética", status: "PUBLICADO", valor: 2900 },
    { nome: "Diego Martins", empresa: "Martins Store", nicho: "E-commerce", status: "EM_PRODUCAO", valor: 5200 },
    { nome: "Patrícia Gomes", empresa: "Gomes Idiomas", nicho: "Educação", status: "FINALIZADO", valor: 2100 },
    { nome: "Thiago Rocha", empresa: "Rocha Reformas", nicho: "Serviços locais", status: "EM_REVISAO", valor: 1800 },
    { nome: "Juliana Pires", empresa: "Pires Coach", nicho: "Infoprodutos", status: "PUBLICADO", valor: 6200 },
    { nome: "Eduardo Nunes", empresa: "Nunes Corretora", nicho: "Imobiliário", status: "EM_PRODUCAO", valor: 3600 },
    { nome: "Larissa Castro", empresa: "Castro Estética Avançada", nicho: "Saúde e Estética", status: "FINALIZADO", valor: 4100 },
    { nome: "Vinícius Barros", empresa: "Barros Digital", nicho: "E-commerce", status: "EM_REVISAO", valor: 2700 },
  ] as const;

  const clientes = [];
  for (let i = 0; i < clientesSeed.length; i++) {
    const c = clientesSeed[i];
    const dataEntrada = daysAgo(150 - i * 10);
    const cliente = await prisma.cliente.create({
      data: {
        nome: c.nome,
        empresa: c.empresa,
        whatsapp: "(11) 9" + (8000 + i * 137).toString().padStart(8, "0"),
        instagram: "@" + c.empresa.toLowerCase().replace(/\s+/g, ""),
        email: c.nome.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        site: c.status === "PUBLICADO" || c.status === "FINALIZADO"
          ? `https://${c.empresa.toLowerCase().replace(/\s+/g, "")}.com.br`
          : null,
        nicho: c.nicho,
        planoContratado: i % 3 === 0 ? "Landing + Pack de Artes" : "Landing Page",
        valor: c.valor,
        responsavelId: pick(membros, i).id,
        dataEntrada,
        prazo: daysFromNow(i % 4 === 0 ? -3 : 7 + i),
        status: c.status as never,
        observacoes:
          i % 3 === 0
            ? "Cliente solicitou alterar a cor do botão principal e adicionar mais um depoimento antes da publicação."
            : null,
      },
    });
    clientes.push(cliente);

    await prisma.timelineEvent.createMany({
      data: [
        { clienteId: cliente.id, data: dataEntrada, titulo: "Cliente criado", descricao: "Fechamento confirmado pelo Closer." },
        { clienteId: cliente.id, data: daysAgo(150 - i * 10 - 2), titulo: "Briefing recebido", descricao: "Formulário de briefing preenchido pelo cliente." },
        { clienteId: cliente.id, data: daysAgo(150 - i * 10 - 5), titulo: "Landing iniciada", descricao: "Estrutura e copy em produção." },
        ...(c.status === "PUBLICADO" || c.status === "FINALIZADO"
          ? [{ clienteId: cliente.id, data: daysAgo(150 - i * 10 - 9), titulo: "Landing publicada", descricao: "Página no ar e validada com o cliente." }]
          : []),
      ],
    });

    const etapaProjeto =
      c.status === "EM_PRODUCAO" ? pick(["BRIEFING", "DESIGN", "DESENVOLVIMENTO"], i) :
      c.status === "EM_REVISAO" ? "REVISAO" :
      "PUBLICADO";

    await prisma.projeto.create({
      data: {
        clienteId: cliente.id,
        prazo: daysFromNow(i % 4 === 0 ? -3 : 5 + i),
        responsavelId: arquiteto.id,
        status: etapaProjeto as never,
        observacoes: i % 4 === 0 ? "Atrasado — aguardando aprovação de copy do cliente." : null,
      },
    });

    const numPagamentos = 1 + (i % 3);
    for (let p = 0; p < numPagamentos; p++) {
      await prisma.pagamento.create({
        data: {
          clienteId: cliente.id,
          valor: c.valor / numPagamentos,
          pago: p < numPagamentos - 1 || c.status !== "EM_PRODUCAO",
          formaPagamento: pick(["Pix", "Cartão de crédito", "Boleto", "Transferência"], i + p),
          data: daysAgo(90 - i * 7 - p * 20),
        },
      });
    }
  }

  console.log("Criando leads...");
  const leadsSeed = [
    { nome: "Carla Mendes", empresa: "Mendes Beauty", etapa: "NOVO", origem: "Instagram", valor: 2200 },
    { nome: "Roberto Dias", empresa: "Dias Contábil", etapa: "NOVO", origem: "Indicação", valor: 1900 },
    { nome: "Aline Ferreira", empresa: "Ferreira Nutrição", etapa: "PRIMEIRO_CONTATO", origem: "Instagram", valor: 2500 },
    { nome: "Marcelo Cunha", empresa: "Cunha Imóveis", etapa: "PRIMEIRO_CONTATO", origem: "Prospecção ativa", valor: 3300 },
    { nome: "Beatriz Santos", empresa: "Santos Pilates", etapa: "RESPONDENDO", origem: "WhatsApp", valor: 2100 },
    { nome: "Felipe Araújo", empresa: "Araújo Cursos", etapa: "RESPONDENDO", origem: "Indicação", valor: 4200 },
    { nome: "Gabriela Moura", empresa: "Moura Joias", etapa: "REUNIAO", origem: "Site", valor: 2800 },
    { nome: "André Lopes", empresa: "Lopes Marcenaria", etapa: "REUNIAO", origem: "Indicação", valor: 1700 },
    { nome: "Renata Pinto", empresa: "Pinto Psicologia", etapa: "PROPOSTA_ENVIADA", origem: "Instagram", valor: 2600 },
    { nome: "Gustavo Ramos", empresa: "Ramos Fitness", etapa: "PROPOSTA_ENVIADA", origem: "Prospecção ativa", valor: 3100 },
    { nome: "Isabela Teixeira", empresa: "Teixeira Eventos", etapa: "NEGOCIACAO", origem: "Indicação", valor: 3900 },
    { nome: "Leandro Cardoso", empresa: "Cardoso Consultoria", etapa: "NEGOCIACAO", origem: "Site", valor: 5400 },
    { nome: "Tatiane Farias", empresa: "Farias Estética", etapa: "NEGOCIACAO", origem: "Instagram", valor: 2300 },
    { nome: "Vanessa Reis", empresa: "Reis Idiomas", etapa: "PERDIDO", origem: "Instagram", valor: 1500 },
    { nome: "Caio Monteiro", empresa: "Monteiro Auto Peças", etapa: "PERDIDO", origem: "WhatsApp", valor: 2000 },
    { nome: "Marina Costa", empresa: "Estúdio Bella Pele", etapa: "FECHADO", origem: "Indicação", valor: 2400, clienteIdx: 0 },
    { nome: "Henrique Lima", empresa: "Lima Advocacia", etapa: "FECHADO", origem: "Site", valor: 3800, clienteIdx: 1 },
    { nome: "Patrícia Gomes", empresa: "Gomes Idiomas", etapa: "FECHADO", origem: "Prospecção ativa", valor: 2100, clienteIdx: 6 },
  ] as const;

  for (let i = 0; i < leadsSeed.length; i++) {
    const l = leadsSeed[i];
    await prisma.lead.create({
      data: {
        nome: l.nome,
        empresa: l.empresa,
        whatsapp: "(11) 9" + (7000 + i * 211).toString().padStart(8, "0"),
        instagram: "@" + l.empresa.toLowerCase().replace(/\s+/g, ""),
        email: l.nome.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        origem: l.origem,
        valorEstimado: l.valor,
        etapa: l.etapa as never,
        clienteId: "clienteIdx" in l ? clientes[l.clienteIdx].id : null,
        createdAt: daysAgo(60 - i * 3),
        updatedAt: daysAgo(Math.max(0, 30 - i * 2)),
      },
    });
  }

  console.log("Criando tarefas...");
  const tarefasSeed = [
    { titulo: "Enviar proposta para Cardoso Consultoria", prioridade: "ALTA", status: "A_FAZER", prazo: daysFromNow(1), resp: closer },
    { titulo: "Cobrar pagamento de Martins Store", prioridade: "ALTA", status: "A_FAZER", prazo: daysAgo(2), resp: closer },
    { titulo: "Fazer revisão da Landing da Alves Imóveis", prioridade: "MEDIA", status: "EM_ANDAMENTO", prazo: daysFromNow(2), resp: arquiteto },
    { titulo: "Publicar Landing da Pires Coach", prioridade: "ALTA", status: "EM_ANDAMENTO", prazo: daysFromNow(0), resp: arquiteto },
    { titulo: "Criar Pack de Artes para Método Tavares", prioridade: "MEDIA", status: "A_FAZER", prazo: daysFromNow(5), resp: arquiteto },
    { titulo: "Follow-up com Isabela Teixeira", prioridade: "MEDIA", status: "A_FAZER", prazo: daysFromNow(3), resp: closer },
    { titulo: "Ajustar depoimentos da Castro Estética Avançada", prioridade: "BAIXA", status: "CONCLUIDA", prazo: daysAgo(5), resp: arquiteto },
    { titulo: "Gravar feedback de publicação com Ribeiro Odontologia", prioridade: "BAIXA", status: "CONCLUIDA", prazo: daysAgo(10), resp: closer },
  ] as const;

  for (const t of tarefasSeed) {
    await prisma.tarefa.create({
      data: {
        titulo: t.titulo,
        prioridade: t.prioridade as never,
        status: t.status as never,
        prazo: t.prazo,
        responsavelId: t.resp.id,
      },
    });
  }

  console.log("Criando SOPs...");
  await prisma.sOP.createMany({
    data: [
      { titulo: "Processo Comercial", categoria: "Comercial", conteudo: null },
      { titulo: "Processo de Produção", categoria: "Produção", conteudo: null },
      { titulo: "Processo de Entrega", categoria: "Entrega", conteudo: null },
      { titulo: "Processo de Atendimento", categoria: "Atendimento", conteudo: null },
    ],
  });

  console.log("Criando links internos...");
  await prisma.linkInterno.createMany({
    data: [
      { nome: "GitHub", url: "https://github.com/espectra", icone: "github", ordem: 0 },
      { nome: "Vercel", url: "https://vercel.com/espectra", icone: "triangle", ordem: 1 },
      { nome: "Figma", url: "https://figma.com/files/espectra", icone: "figma", ordem: 2 },
      { nome: "Google Drive", url: "https://drive.google.com/drive/espectra", icone: "hard-drive", ordem: 3 },
      { nome: "Notion", url: "https://notion.so/espectra", icone: "notebook", ordem: 4 },
      { nome: "Canva", url: "https://canva.com/espectra", icone: "palette", ordem: 5 },
      { nome: "Documentações", url: "https://drive.google.com/drive/espectra/docs", icone: "file-text", ordem: 6 },
    ],
  });

  console.log("Criando configuração da empresa...");
  await prisma.configuracaoEmpresa.create({
    data: { nomeEmpresa: "Espectra", tema: "dark-navy" },
  });

  console.log("Criando log de atividades...");
  const atividades = [
    { tipo: "lead_criado", descricao: "Novo lead 'Carla Mendes' (Mendes Beauty) adicionado", dias: 1 },
    { tipo: "pagamento", descricao: "Pagamento de R$ 1.733 confirmado por Diego Martins", dias: 1 },
    { tipo: "projeto", descricao: "Landing da Pires Coach avançou para Publicado", dias: 2 },
    { tipo: "lead_etapa", descricao: "Lead 'Cardoso Consultoria' avançou para Negociação", dias: 2 },
    { tipo: "cliente_status", descricao: "Alves Imóveis entrou em Revisão", dias: 3 },
    { tipo: "tarefa", descricao: "Tarefa 'Ajustar depoimentos da Castro Estética Avançada' concluída", dias: 4 },
    { tipo: "cliente_criado", descricao: "Novo cliente 'Vinícius Barros' (Barros Digital) cadastrado", dias: 5 },
    { tipo: "lead_perdido", descricao: "Lead 'Caio Monteiro' marcado como Perdido", dias: 6 },
    { tipo: "pagamento", descricao: "Pagamento de R$ 2.067 confirmado por Juliana Pires", dias: 7 },
    { tipo: "projeto", descricao: "Briefing da Nunes Corretora recebido", dias: 8 },
    { tipo: "lead_etapa", descricao: "Lead 'Isabela Teixeira' avançou para Negociação", dias: 9 },
    { tipo: "tarefa", descricao: "Tarefa 'Publicar Landing da Pires Coach' criada", dias: 10 },
    { tipo: "cliente_status", descricao: "Ribeiro Odontologia foi Publicado", dias: 12 },
    { tipo: "lead_criado", descricao: "Novo lead 'Gustavo Ramos' (Ramos Fitness) adicionado", dias: 13 },
    { tipo: "pagamento", descricao: "Pagamento de R$ 1.400 pendente para Bruno Tavares", dias: 14 },
  ];

  for (const a of atividades) {
    await prisma.activityLog.create({
      data: {
        tipo: a.tipo,
        descricao: a.descricao,
        createdAt: daysAgo(a.dias),
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
