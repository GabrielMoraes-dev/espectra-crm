function formatTelefoneBR(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return digitos;
}

export async function sendMensagemFixaWhatsApp(telefone: string, mensagem: string) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token || !clientToken) {
    console.error("[whatsapp] Z-API não configurado, mensagem não enviada:", mensagem);
    return;
  }

  try {
    await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": clientToken,
      },
      body: JSON.stringify({
        phone: formatTelefoneBR(telefone),
        message: mensagem,
      }),
    });
  } catch (error) {
    console.error("[whatsapp] Falha ao enviar mensagem via Z-API", error);
  }
}
