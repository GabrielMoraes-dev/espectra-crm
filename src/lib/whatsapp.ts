import { prisma } from "@/lib/prisma";

const TIMEOUT_MS = 15_000;

function formatTelefoneBR(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return digitos;
}

// Nunca logar o telefone completo — só os 4 últimos dígitos, o suficiente pra
// identificar num log sem expor o número inteiro.
function mascararTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.length > 4 ? `${"*".repeat(digitos.length - 4)}${digitos.slice(-4)}` : "****";
}

export type ResultadoEnvioWhatsapp =
  | { ok: true }
  | {
      ok: false;
      motivo: "integracao_pausada" | "nao_configurado" | "timeout" | "erro_rede" | "erro_http";
      detalhe?: string;
    };

async function registrarFalhaWhatsapp(clienteId: string | undefined, motivo: string) {
  // Best-effort, mesmo padrão de registrarFalhaEnvio em email.ts — nunca grava
  // token, telefone completo ou conteúdo da mensagem.
  try {
    await prisma.activityLog.create({
      data: {
        tipo: "whatsapp_falhou",
        descricao: `Falha ao enviar mensagem via Z-API (${motivo})`,
        entidadeTipo: clienteId ? "cliente" : null,
        entidadeId: clienteId ?? null,
      },
    });
  } catch {
    // se nem isso funcionar, já registramos no console acima
  }
}

/**
 * Envia mensagem fixa via Z-API — desativado por padrão. Só o valor exato
 * `ZAPI_ENABLED=true` liga o envio real; ausência da variável (ou qualquer
 * outro valor) mantém a integração pausada, mesmo que as credenciais existam.
 * `clienteId` é opcional, só usado pra dar contexto ao ActivityLog de falha.
 */
export async function sendMensagemFixaWhatsApp(
  telefone: string,
  mensagem: string,
  clienteId?: string,
): Promise<ResultadoEnvioWhatsapp> {
  if (process.env.ZAPI_ENABLED !== "true") {
    return { ok: false, motivo: "integracao_pausada" };
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token || !clientToken) {
    console.error("[whatsapp] ZAPI_ENABLED=true mas faltam variáveis de credencial da Z-API.");
    await registrarFalhaWhatsapp(clienteId, "nao_configurado");
    return { ok: false, motivo: "nao_configurado" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": clientToken,
      },
      body: JSON.stringify({
        phone: formatTelefoneBR(telefone),
        message: mensagem,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[whatsapp] Z-API respondeu status ${res.status} para ${mascararTelefone(telefone)}`);
      await registrarFalhaWhatsapp(clienteId, "erro_http");
      return { ok: false, motivo: "erro_http", detalhe: `status ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    const foiTimeout = error instanceof Error && error.name === "AbortError";
    console.error(
      `[whatsapp] Falha ao enviar mensagem via Z-API para ${mascararTelefone(telefone)}${foiTimeout ? " (timeout)" : ""}`,
    );
    await registrarFalhaWhatsapp(clienteId, foiTimeout ? "timeout" : "erro_rede");
    return { ok: false, motivo: foiTimeout ? "timeout" : "erro_rede" };
  } finally {
    clearTimeout(timeoutId);
  }
}
