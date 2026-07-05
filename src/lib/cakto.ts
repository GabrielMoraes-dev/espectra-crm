import "server-only";

const CAKTO_API_URL = "https://api.cakto.com.br/public_api";

async function getAccessToken() {
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Integração com a Cakto não configurada");
  }

  const res = await fetch(`${CAKTO_API_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    throw new Error("Não foi possível autenticar com a Cakto");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function criarLinkPagamento({
  clienteId,
  clienteNome,
  valor,
}: {
  clienteId: string;
  clienteNome: string;
  valor: number;
}) {
  const productId = process.env.CAKTO_PRODUCT_ID;
  if (!productId) {
    throw new Error("Integração com a Cakto não configurada");
  }

  const token = await getAccessToken();

  const res = await fetch(`${CAKTO_API_URL}/offers/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `Presença Digital Premium - ${clienteNome}`,
      price: valor,
      product: productId,
      units: 1,
      type: "unique",
    }),
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => null);
    const mensagem = erro?.price?.[0] ?? erro?.detail;
    throw new Error(mensagem || "Não foi possível gerar o link de pagamento na Cakto");
  }

  const oferta = (await res.json()) as { id: string };
  return `https://pay.cakto.com.br/${oferta.id}?sck=${clienteId}`;
}
