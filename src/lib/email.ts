import nodemailer from "nodemailer";
import type { Briefing, BriefingInicial, Lead, Projeto, Cliente, Pagamento } from "@/generated/prisma/client";
import { formatDateShort, formatCurrency, getPrazoUrgencia } from "@/lib/utils";

const NOTIFICATION_EMAIL = "hello.espectra@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://espectra-crm.vercel.app";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NOTIFICATION_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error(`[email] GMAIL_APP_PASSWORD não configurado, email "${subject}" não enviado para ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `Espectra <${NOTIFICATION_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`[email] Falha ao enviar "${subject}" para ${to}`, error);
  }
}

export async function sendBriefingNotification(briefing: Briefing) {
  const link = briefing.clienteId ? `${SITE_URL}/clientes/${briefing.clienteId}` : null;

  await enviarEmail({
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
}

export async function sendBriefingInicialNotification(
  briefingInicial: BriefingInicial & { leadId: string },
) {
  const link = `${SITE_URL}/leads`;

  await enviarEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Briefing inicial recebido — ${briefingInicial.nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <p><strong>${briefingInicial.nome}</strong> (${briefingInicial.profissao}) preencheu o briefing inicial — pronto pra montar a amostra gratuita.</p>
        <p><a href="${link}" style="color: #5483b3;">Ver lead no CRM →</a></p>
      </div>
    `,
  });
}

export async function sendBriefingConfirmation(briefing: Briefing) {
  if (!briefing.email) return;

  await enviarEmail({
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
}

export async function sendBriefingInicialConfirmation(briefingInicial: BriefingInicial) {
  await enviarEmail({
    to: briefingInicial.email,
    subject: "Recebemos sua amostra gratuita!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <img src="${SITE_URL}/logo-espectra.png" alt="Espectra" style="height: 32px; margin-bottom: 24px;" />
        <p>Olá, ${briefingInicial.nome}!</p>
        <p style="color: #555;">
          Recebemos as informações que você enviou. Em breve vamos preparar sua amostra gratuita
          e entrar em contato com os próximos passos.
        </p>
      </div>
    `,
  });
}

export async function sendProjetoPublicadoEmail(cliente: Cliente) {
  if (!cliente.email || !cliente.site) return;

  await enviarEmail({
    to: cliente.email,
    subject: "Seu site está no ar! 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <img src="${SITE_URL}/logo-espectra.png" alt="Espectra" style="height: 32px; margin-bottom: 24px;" />
        <p>Olá, ${cliente.nome.split(" ")[0]}!</p>
        <p style="color: #555;">
          Seu projeto foi publicado! Sua nova presença digital já está no ar:
        </p>
        <p><a href="${cliente.site}" style="color: #5483b3;">${cliente.site} →</a></p>
      </div>
    `,
  });
}

export async function sendPesquisaSatisfacaoEmail(cliente: Cliente) {
  if (!cliente.email) return;
  const link = `${SITE_URL}/pesquisa/${cliente.id}`;

  await enviarEmail({
    to: cliente.email,
    subject: "Como foi sua experiência com a Espectra?",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <img src="${SITE_URL}/logo-espectra.png" alt="Espectra" style="height: 32px; margin-bottom: 24px;" />
        <p>Olá, ${cliente.nome.split(" ")[0]}!</p>
        <p style="color: #555;">
          Seu projeto com a Espectra foi entregue 🎉 Queremos muito saber o que você achou —
          leva menos de um minuto:
        </p>
        <p><a href="${link}" style="color: #5483b3;">Responder pesquisa de satisfação →</a></p>
      </div>
    `,
  });
}

export async function sendPagamentoConfirmadoEmail(cliente: Cliente, valor: number) {
  if (!cliente.email) return;

  await enviarEmail({
    to: cliente.email,
    subject: "Recebemos seu pagamento!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <img src="${SITE_URL}/logo-espectra.png" alt="Espectra" style="height: 32px; margin-bottom: 24px;" />
        <p>Olá, ${cliente.nome.split(" ")[0]}!</p>
        <p style="color: #555;">
          Confirmamos o recebimento do seu pagamento de <strong>${formatCurrency(valor)}</strong>.
          Obrigado pela confiança!
        </p>
      </div>
    `,
  });
}

export async function sendPagamentoRecebidoInterno(cliente: Cliente, valor: number) {
  const link = `${SITE_URL}/clientes/${cliente.id}`;

  await enviarEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Pagamento confirmado — ${cliente.nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <p><strong>${cliente.nome}</strong> pagou <strong>${formatCurrency(valor)}</strong>.</p>
        <p><a href="${link}" style="color: #5483b3;">Ver cliente no CRM →</a></p>
      </div>
    `,
  });
}

export async function sendContratoAssinadoInterno(cliente: Cliente) {
  const link = `${SITE_URL}/clientes/${cliente.id}`;

  await enviarEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Contrato assinado — ${cliente.nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <p><strong>${cliente.nome}</strong> assinou o contrato.</p>
        <p><a href="${link}" style="color: #5483b3;">Ver cliente no CRM →</a></p>
      </div>
    `,
  });
}

export async function sendStaleLeadReminder(leads: Lead[]) {
  const itens = leads
    .map(
      (lead) =>
        `<li><strong>${lead.nome}</strong>${lead.empresa ? ` (${lead.empresa})` : ""} — link enviado em ${formatDateShort(lead.linkCopiadoEm)}, sem resposta ao briefing</li>`,
    )
    .join("");

  await enviarEmail({
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
}

export async function sendPrazoDigest(projetos: (Projeto & { cliente: Cliente })[]) {
  const itens = projetos
    .map((projeto) => {
      const urgencia = getPrazoUrgencia(projeto.prazo);
      const situacao = urgencia ? urgencia.label : `prazo em ${formatDateShort(projeto.prazo)}`;
      return `<li><strong>${projeto.cliente.nome}</strong> — ${situacao}</li>`;
    })
    .join("");

  await enviarEmail({
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
}

export async function sendPagamentoAtrasado(pagamentos: (Pagamento & { cliente: Cliente })[]) {
  const itens = pagamentos
    .map(
      (pagamento) =>
        `<li><strong>${pagamento.cliente.nome}</strong> — ${formatCurrency(pagamento.valor)}, previsto para ${formatDateShort(pagamento.data)}</li>`,
    )
    .join("");

  await enviarEmail({
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
}

export async function sendPagamentoSemMatch(compra: {
  nome: string;
  email: string;
  telefone: string;
  valor: number;
}) {
  const valorFormatado = compra.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  await enviarEmail({
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
}
