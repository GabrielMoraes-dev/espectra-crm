"use server";

import { revalidatePath } from "next/cache";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://espectra-crm.vercel.app";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
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
  const before = await prisma.cliente.findUniqueOrThrow({ where: { id } });

  const cliente = await prisma.cliente.update({
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

  if (!before.contratoUrl && cliente.contratoUrl) {
    await prisma.timelineEvent.create({
      data: { clienteId: cliente.id, titulo: "Contrato anexado" },
    });
  }

  if (before.status !== cliente.status) {
    await prisma.timelineEvent.create({
      data: {
        clienteId: cliente.id,
        titulo: STATUS_CLIENTE_CONFIG[cliente.status].label,
      },
    });
    await prisma.activityLog.create({
      data: {
        tipo: "cliente_status",
        descricao: `${cliente.nome} mudou para ${STATUS_CLIENTE_CONFIG[cliente.status].label}`,
        entidadeTipo: "cliente",
        entidadeId: cliente.id,
      },
    });

    if (cliente.status === "FINALIZADO" && cliente.valor) {
      const jaTemPagamento = await prisma.pagamento.count({ where: { clienteId: id } });
      if (jaTemPagamento === 0) {
        await prisma.pagamento.create({
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

    if (cliente.status === "FINALIZADO" && cliente.whatsapp) {
      const link = `${SITE_URL}/pesquisa/${cliente.id}`;
      await sendMensagemFixaWhatsApp(
        cliente.whatsapp,
        `Olá, ${cliente.nome.split(" ")[0]}! Seu projeto com a Espectra foi entregue 🎉 Queremos muito saber o que você achou — leva menos de um minuto: ${link}`,
      );
    }

    if (cliente.status === "PUBLICADO") {
      await sendProjetoPublicadoEmail(cliente);
    }

    if (cliente.status === "FINALIZADO") {
      await sendPesquisaSatisfacaoEmail(cliente);
    }
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/financeiro");
  revalidatePath("/");
  return cliente;
}

export async function deleteCliente(id: string) {
  await requireAuth();
  await prisma.cliente.delete({ where: { id } });
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
