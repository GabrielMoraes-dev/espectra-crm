"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { leadSchema, convertLeadSchema, type LeadFormValues, type ConvertLeadValues } from "@/lib/validations";
import { ETAPA_LEAD_CONFIG } from "@/lib/constants";

function clean(v: string | undefined | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createLead(values: LeadFormValues) {
  const data = leadSchema.parse(values);

  const lead = await prisma.lead.create({
    data: {
      nome: data.nome,
      empresa: clean(data.empresa),
      whatsapp: clean(data.whatsapp),
      instagram: clean(data.instagram),
      email: clean(data.email),
      origem: clean(data.origem),
      valorEstimado: data.valorEstimado ?? null,
      observacoes: clean(data.observacoes),
      etapa: data.etapa,
    },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "lead_criado",
      descricao: `Novo lead '${lead.nome}'${lead.empresa ? ` (${lead.empresa})` : ""} adicionado`,
      entidadeTipo: "lead",
      entidadeId: lead.id,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  return lead;
}

export async function updateLead(id: string, values: LeadFormValues) {
  const data = leadSchema.parse(values);

  const before = await prisma.lead.findUniqueOrThrow({ where: { id } });

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      nome: data.nome,
      empresa: clean(data.empresa),
      whatsapp: clean(data.whatsapp),
      instagram: clean(data.instagram),
      email: clean(data.email),
      origem: clean(data.origem),
      valorEstimado: data.valorEstimado ?? null,
      observacoes: clean(data.observacoes),
      etapa: data.etapa,
    },
  });

  if (before.etapa !== lead.etapa) {
    await prisma.activityLog.create({
      data: {
        tipo: "lead_etapa",
        descricao: `Lead '${lead.nome}' avançou para ${ETAPA_LEAD_CONFIG[lead.etapa].label}`,
        entidadeTipo: "lead",
        entidadeId: lead.id,
      },
    });
  }

  revalidatePath("/leads");
  revalidatePath("/");
  return lead;
}

export async function moveLeadEtapa(id: string, etapa: LeadFormValues["etapa"]) {
  const lead = await prisma.lead.update({ where: { id }, data: { etapa } });

  await prisma.activityLog.create({
    data: {
      tipo: etapa === "PERDIDO" ? "lead_perdido" : "lead_etapa",
      descricao:
        etapa === "PERDIDO"
          ? `Lead '${lead.nome}' marcado como Perdido`
          : `Lead '${lead.nome}' avançou para ${ETAPA_LEAD_CONFIG[etapa].label}`,
      entidadeTipo: "lead",
      entidadeId: lead.id,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  return lead;
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function convertLeadToCliente(leadId: string, values: ConvertLeadValues) {
  const data = convertLeadSchema.parse(values);
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  const cliente = await prisma.cliente.create({
    data: {
      nome: lead.nome,
      empresa: lead.empresa,
      whatsapp: lead.whatsapp,
      instagram: lead.instagram,
      email: lead.email,
      nicho: clean(data.nicho),
      planoContratado: clean(data.planoContratado),
      valor: data.valor ?? lead.valorEstimado ?? null,
      responsavelId: clean(data.responsavelId),
      status: "EM_PRODUCAO",
    },
  });

  await prisma.timelineEvent.create({
    data: {
      clienteId: cliente.id,
      titulo: "Cliente criado",
      descricao: "Convertido a partir de um lead fechado.",
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { etapa: "FECHADO", clienteId: cliente.id },
  });

  await prisma.activityLog.create({
    data: {
      tipo: "cliente_criado",
      descricao: `Novo cliente '${cliente.nome}'${cliente.empresa ? ` (${cliente.empresa})` : ""} cadastrado`,
      entidadeTipo: "cliente",
      entidadeId: cliente.id,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");
  revalidatePath("/");
  return cliente;
}
