import { Resend } from "resend";
import type { Briefing } from "@/generated/prisma/client";

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
            <strong>Cidade:</strong> ${briefing.cidade}${briefing.estado ? `/${briefing.estado}` : ""}<br/>
            <strong>Objetivo da landing:</strong> ${briefing.objetivo}
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
