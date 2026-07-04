import { Resend } from "resend";
import type { Briefing, Lead, Projeto, Cliente, Pagamento } from "@/generated/prisma/client";
import { formatDateShort, formatCurrency, getPrazoUrgencia } from "@/lib/utils";

const NOTIFICATION_EMAIL = "hello.espectra@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://espectra-crm.vercel.app";

export async function sendBriefingNotification(briefing: Briefing) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, notificação não enviada");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const link = briefing.clienteId ? `${SITE_URL}/clientes/${briefing.clienteId}` : null;

  try {
    await resend.emails.send({
      from: "Espectra CRM <onboarding@resend.dev>",
      to: NOTIFICATION_EMAIL,
      subject: `Novo briefing recebido — ${briefing.nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p><strong>${briefing.nome}</strong> (${briefing.profissao}) acabou de enviar o briefing.</p>
          <p style="color: #555;">
            <strong>Cidade:</strong> ${briefing.cidade}${briefing.estado ? `/${briefing.estado}` : ""}
          </p>
          ${
            link
              ? `<p><a href="${link}" style="color: #5483b3;">Ver briefing completo no CRM →</a></p>`
              : `<p style="color: #888;">Sem cliente vinculado (formulário em branco).</p>`
          }
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar notificação de briefing", error);
  }
}

export async function sendBriefingConfirmation(briefing: Briefing) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, confirmação não enviada");
    return;
  }
  if (!briefing.email) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "Espectra <onboarding@resend.dev>",
      to: briefing.email,
      subject: "Recebemos seu briefing!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <img src="${SITE_URL}/logo-espectra.png" alt="Espectra" style="height: 32px; margin-bottom: 24px;" />
          <p>Olá, ${briefing.nome}!</p>
          <p style="color: #555;">
            Recebemos o briefing que você preencheu. Obrigado por confiar à Espectra a forma como
            o mercado vai te enxergar. Em breve entraremos em contato com os próximos passos.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar confirmação ao cliente", error);
  }
}

export async function sendStaleLeadReminder(leads: Lead[]) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, lembrete não enviado");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const itens = leads
    .map(
      (lead) =>
        `<li><strong>${lead.nome}</strong>${lead.empresa ? ` (${lead.empresa})` : ""} — link enviado em ${formatDateShort(lead.linkCopiadoEm)}, sem resposta ao briefing</li>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Espectra CRM <onboarding@resend.dev>",
      to: NOTIFICATION_EMAIL,
      subject: `${leads.length} lead${leads.length > 1 ? "s" : ""} sem resposta ao briefing`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p>Esses leads ainda não responderam o formulário de briefing:</p>
          <ul style="color: #555;">${itens}</ul>
          <p><a href="${SITE_URL}/leads" style="color: #5483b3;">Ver leads no CRM →</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar lembrete de leads parados", error);
  }
}

export async function sendPrazoDigest(projetos: (Projeto & { cliente: Cliente })[]) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, resumo de prazos não enviado");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const itens = projetos
    .map((projeto) => {
      const urgencia = getPrazoUrgencia(projeto.prazo);
      const situacao = urgencia ? urgencia.label : `prazo em ${formatDateShort(projeto.prazo)}`;
      return `<li><strong>${projeto.cliente.nome}</strong> — ${situacao}</li>`;
    })
    .join("");

  try {
    await resend.emails.send({
      from: "Espectra CRM <onboarding@resend.dev>",
      to: NOTIFICATION_EMAIL,
      subject: `Resumo semanal: ${projetos.length} projeto${projetos.length > 1 ? "s" : ""} com prazo próximo`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p>Projetos com prazo nos próximos 7 dias (ou já atrasados):</p>
          <ul style="color: #555;">${itens}</ul>
          <p><a href="${SITE_URL}/projetos" style="color: #5483b3;">Ver projetos no CRM →</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar resumo de prazos", error);
  }
}

export async function sendPagamentoAtrasado(pagamentos: (Pagamento & { cliente: Cliente })[]) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, alerta de pagamento atrasado não enviado");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const itens = pagamentos
    .map(
      (pagamento) =>
        `<li><strong>${pagamento.cliente.nome}</strong> — ${formatCurrency(pagamento.valor)}, previsto para ${formatDateShort(pagamento.data)}</li>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Espectra CRM <onboarding@resend.dev>",
      to: NOTIFICATION_EMAIL,
      subject: `${pagamentos.length} pagamento${pagamentos.length > 1 ? "s" : ""} atrasado${pagamentos.length > 1 ? "s" : ""}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p>Esses pagamentos já passaram da data prevista e ainda não foram confirmados:</p>
          <ul style="color: #555;">${itens}</ul>
          <p><a href="${SITE_URL}/financeiro" style="color: #5483b3;">Ver financeiro no CRM →</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar alerta de pagamento atrasado", error);
  }
}

export async function sendPagamentoSemMatch(compra: {
  nome: string;
  email: string;
  telefone: string;
  valor: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurado, alerta de pagamento não enviado");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const valorFormatado = compra.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  try {
    await resend.emails.send({
      from: "Espectra CRM <onboarding@resend.dev>",
      to: NOTIFICATION_EMAIL,
      subject: `Pagamento recebido sem cliente correspondente — ${compra.nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p>Chegou um pagamento aprovado na Cakto, mas não encontramos nenhum cliente com esse email ou telefone no CRM:</p>
          <p style="color: #555;">
            <strong>Nome:</strong> ${compra.nome}<br/>
            <strong>Email:</strong> ${compra.email}<br/>
            <strong>Telefone:</strong> ${compra.telefone}<br/>
            <strong>Valor:</strong> ${valorFormatado}
          </p>
          <p style="color: #888;">Vincule manualmente ao cliente certo no CRM.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar alerta de pagamento sem match", error);
  }
}
