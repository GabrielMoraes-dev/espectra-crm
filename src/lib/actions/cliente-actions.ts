"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import {
  clienteSchema,
  timelineEventSchema,
  type ClienteFormValues,
  type TimelineEventValues,
} from "@/lib/validations";
import { STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import { requireAuth } from "@/lib/auth/session";
import { sendMensagemFixaWhatsApp } from "@/lib/whatsapp";
import { sendProjetoPublicadoEmail, sendPesquisaSatisfacaoEmail } from "@/lib/email";
import type { Cliente, StatusCliente, Prisma } from "@/generated/prisma/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://espectra-crm.vercel.app";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

// Só as escritas no banco, sempre dentro da MESMA transação de quem mudou o
// status (recebe `tx`, nunca abre a própria transação) — sem isso, o Cliente
// podia ficar com o status novo já commitado mesmo que TimelineEvent/ActivityLog/
// Pagamento falhassem logo depois, um estado parcial inconsistente.
export async function handleClienteStatusChange(
  tx: Prisma.TransactionClient,
  cliente: Cliente,
  statusAnterior: StatusCliente,
) {
  // Por ser exportada de um arquivo "use server", vira uma Server Action invocável
  // por conta própria — os dois pontos que já chamam essa função (updateCliente,
  // registerStatusChange) já passam por requireAuth() antes, mas essa checagem
  // aqui dentro garante que ninguém consiga chamar essa função direto sem sessão.
  await requireAuth();
  if (statusAnterior === cliente.status) return;

  await tx.timelineEvent.create({
    data: {
      clienteId: cliente.id,
      titulo: STATUS_CLIENTE_CONFIG[cliente.status].label,
    },
  });
  await tx.activityLog.create({
    data: {
      tipo: "cliente_status",
      descricao: `${cliente.nome} mudou para ${STATUS_CLIENTE_CONFIG[cliente.status].label}`,
      entidadeTipo: "cliente",
      entidadeId: cliente.id,
    },
  });

  if (cliente.status === "FINALIZADO" && cliente.valor) {
    // Ainda sujeito a corrida em tese (count + create não é uma constraint) —
    // risco residual documentado, não uma garantia forte de "no máximo um
    // pagamento automático". Ver memory/jornada-completa-do-cliente.md.
    const jaTemPagamento = await tx.pagamento.count({ where: { clienteId: cliente.id } });
    if (jaTemPagamento === 0) {
      await tx.pagamento.create({
        data: {
          clienteId: cliente.id,
          valor: cliente.valor,
          pago: false,
          formaPagamento: null,
          data: new Date(),
        },
      });
    }
  }
}

// Efeitos externos (WhatsApp, e-mail) — sempre chamada DEPOIS que a transação
// de `handleClienteStatusChange` já deu commit, nunca dentro dela (uma API
// externa lenta/travada não pode segurar a transação de banco aberta). Cada
// efeito já engole a própria falha (não lança), então uma falha externa nunca
// corrompe o que já foi gravado no banco.
export async function dispararEfeitosExternosStatusCliente(
  cliente: Cliente,
  statusAnterior: StatusCliente,
) {
  // Por ser exportada de um arquivo "use server", vira Server Action invocável
  // por conta própria — sem essa checagem, qualquer chamada direta (fora do
  // fluxo autenticado normal) poderia disparar WhatsApp/e-mail com um `cliente`
  // fabricado (telefone/email arbitrários), sem nenhuma sessão válida.
  await requireAuth();

  // Mesma guarda de handleClienteStatusChange — sem isso, editar qualquer outro
  // campo de um cliente que já está Finalizado/Publicado reenviaria WhatsApp/e-mail
  // toda vez, mesmo sem o status ter mudado de fato.
  if (statusAnterior === cliente.status) return;

  if (cliente.status === "FINALIZADO" && cliente.whatsapp) {
    const link = `${SITE_URL}/pesquisa/${cliente.id}`;
    await sendMensagemFixaWhatsApp(
      cliente.whatsapp,
      `Olá, ${cliente.nome.split(" ")[0]}! Seu projeto com a Espectra foi entregue 🎉 Queremos muito saber o que você achou — leva menos de um minuto: ${link}`,
      cliente.id,
    );
  }

  if (cliente.status === "PUBLICADO") {
    await sendProjetoPublicadoEmail(cliente);
  }

  if (cliente.status === "FINALIZADO") {
    await sendPesquisaSatisfacaoEmail(cliente);
  }
}

export async function createCliente(values: ClienteFormValues) {
  await requireAuth();
  const data = clienteSchema.parse(values);

  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      empresa: clean(data.empresa),
      whatsapp: clean(data.whatsapp),
      instagram: clean(data.instagram),
      email: clean(data.email),
      site: clean(data.site),
      cidade: clean(data.cidade),
      estado: clean(data.estado),
      nicho: clean(data.nicho),
      planoContratado: clean(data.planoContratado),
      valor: data.valor ?? null,
      responsavelId: clean(data.responsavelId),
      prazo: data.prazo ? new Date(data.prazo) : null,
      status: data.status,
      contratoUrl: clean(data.contratoUrl),
    },
  });

  await prisma.timelineEvent.create({
    data: { clienteId: cliente.id, titulo: "Cliente criado" },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "cliente_criado",
      descricao: `Novo cliente '${cliente.nome}'${cliente.empresa ? ` (${cliente.empresa})` : ""} cadastrado`,
      entidadeTipo: "cliente",
      entidadeId: cliente.id,
    },
  });

  revalidatePath("/clientes");
  revalidatePath("/");
  return cliente;
}

export async function updateCliente(id: string, values: ClienteFormValues) {
  await requireAuth();
  const data = clienteSchema.parse(values);

  // A mudança de status e seus efeitos internos (timeline/log/pagamento) ficam
  // na mesma transação — evita o cliente ficar com o status novo já commitado
  // sem o efeito interno correspondente, caso algo falhe no meio do caminho.
  // `before` também é lido AQUI DENTRO (não antes de abrir a transação) — lido
  // fora, uma edição concorrente entre a leitura e o commit usaria um
  // `statusAnterior`/`contratoUrl` já obsoleto pra decidir os efeitos.
  const cliente = await prisma.$transaction(async (tx) => {
    const before = await tx.cliente.findUniqueOrThrow({ where: { id } });

    const atualizado = await tx.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
        empresa: clean(data.empresa),
        whatsapp: clean(data.whatsapp),
        instagram: clean(data.instagram),
        email: clean(data.email),
        site: clean(data.site),
        cidade: clean(data.cidade),
        estado: clean(data.estado),
        nicho: clean(data.nicho),
        planoContratado: clean(data.planoContratado),
        valor: data.valor ?? null,
        responsavelId: clean(data.responsavelId),
        prazo: data.prazo ? new Date(data.prazo) : null,
        status: data.status,
        contratoUrl: clean(data.contratoUrl),
      },
    });

    if (!before.contratoUrl && atualizado.contratoUrl) {
      await tx.timelineEvent.create({
        data: { clienteId: atualizado.id, titulo: "Contrato anexado" },
      });
    }

    await handleClienteStatusChange(tx, atualizado, before.status);

    return { atualizado, statusAnterior: before.status };
  });

  // Efeitos externos só depois do commit da transação acima.
  await dispararEfeitosExternosStatusCliente(cliente.atualizado, cliente.statusAnterior);

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/financeiro");
  revalidatePath("/");
  return cliente.atualizado;
}

// "Excluir" move o cliente pra lixeira (reversível) em vez de apagar de vez —
// nada de Lead/Briefing/Blob é tocado aqui, só fica escondido das listas normais.
export async function deleteCliente(id: string) {
  await requireAuth();
  await prisma.cliente.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/clientes");
  revalidatePath("/");
}

export async function restaurarCliente(id: string) {
  await requireAuth();
  await prisma.cliente.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath("/clientes");
  revalidatePath("/");
}

export async function getClientesNaLixeira() {
  await requireAuth();
  return prisma.cliente.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
}

// Apagar de vez, chamado só a partir da Lixeira — aqui sim limpa Lead/Briefing
// órfãos e os arquivos no Vercel Blob, exatamente como o antigo "excluir" fazia.
export async function excluirClientePermanentemente(id: string) {
  await requireAuth();

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { fotos: true, briefings: true, lead: { include: { briefingsIniciais: true } } },
  });

  const urls = new Set<string>();
  if (cliente) {
    for (const foto of cliente.fotos) urls.add(foto.url);
    for (const b of cliente.briefings) {
      for (const url of JSON.parse(b.fotosUrls || "[]")) urls.add(url);
      for (const url of JSON.parse(b.depoimentosUrls || "[]")) urls.add(url);
      for (const url of JSON.parse(b.arquivosGeraisUrls || "[]")) urls.add(url);
    }
    for (const bi of cliente.lead?.briefingsIniciais ?? []) {
      for (const url of JSON.parse(bi.fotosUrls || "[]")) urls.add(url);
    }
  }

  await prisma.$transaction(async (tx) => {
    // Sem isso, o Briefing (guarda CPF/CNPJ, endereço, história pessoal) e o Lead
    // sobreviviam órfãos depois de "excluir" o cliente — o Lead reaparecia no
    // Kanban de Leads com as fotos do briefing inicial já apagadas do Blob abaixo,
    // e o Briefing ficava no banco sem dono nenhum, com dado pessoal sensível.
    await tx.briefing.deleteMany({
      where: { OR: [{ clienteId: id }, ...(cliente?.lead ? [{ leadId: cliente.lead.id }] : [])] },
    });
    if (cliente?.lead) {
      await tx.lead.delete({ where: { id: cliente.lead.id } });
    }
    await tx.cliente.delete({ where: { id } });
  });

  // Só apaga do armazenamento depois de confirmar a exclusão no banco — sem isso,
  // as fotos/depoimentos do cliente ficavam pra sempre no Vercel Blob, sendo
  // cobrados à toa mesmo depois do cliente sumir do CRM.
  for (const url of urls) {
    await del(url).catch(() => {});
  }

  revalidatePath("/clientes");
  revalidatePath("/");
}

export async function updateClienteObservacoes(id: string, observacoes: string) {
  await requireAuth();
  await prisma.cliente.update({ where: { id }, data: { observacoes: clean(observacoes) } });
  revalidatePath(`/clientes/${id}`);
}

export async function addTimelineEvent(clienteId: string, values: TimelineEventValues) {
  await requireAuth();
  const data = timelineEventSchema.parse(values);
  const event = await prisma.timelineEvent.create({
    data: { clienteId, titulo: data.titulo, descricao: clean(data.descricao) },
  });
  revalidatePath(`/clientes/${clienteId}`);
  return event;
}

export async function deleteTimelineEvent(id: string, clienteId: string) {
  await requireAuth();
  await prisma.timelineEvent.delete({ where: { id } });
  revalidatePath(`/clientes/${clienteId}`);
}

export async function addFotoCliente(clienteId: string, url: string) {
  await requireAuth();
  const foto = await prisma.fotoCliente.create({ data: { clienteId, url } });
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/projetos");
  return foto;
}

export async function deleteFotoCliente(id: string, clienteId: string) {
  await requireAuth();
  await prisma.fotoCliente.delete({ where: { id } });
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/projetos");
}
