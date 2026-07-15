import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContratoPdf } from "@/lib/pdf/contrato-pdf";

const AUTENTIQUE_URL = "https://api.autentique.com.br/v2/graphql";

const CREATE_DOCUMENT_MUTATION = `
mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
  createDocument(document: $document, signers: $signers, file: $file) {
    id
  }
}
`;

export async function enviarContratoParaAssinatura({
  clienteId,
  clienteNome,
  clienteEmail,
  clienteCpfCnpj,
  clienteCidadeUf,
  precoFormatado,
  desconto,
  valorFormatado,
  valorExtenso,
}: {
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteCpfCnpj: string;
  clienteCidadeUf: string;
  precoFormatado: string;
  desconto?: number;
  valorFormatado: string;
  valorExtenso: string;
}) {
  const token = process.env.AUTENTIQUE_API_TOKEN;
  if (!token) {
    throw new Error("Integração com a Autentique não configurada");
  }

  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const pdfBuffer = await renderToBuffer(
    ContratoPdf({
      clienteNome,
      clienteCpfCnpj,
      clienteCidadeUf,
      precoFormatado,
      desconto,
      valorFormatado,
      valorExtenso,
      data: dataExtenso,
    }),
  );

  const operations = {
    query: CREATE_DOCUMENT_MUTATION,
    variables: {
      document: { name: `Contrato — ${clienteNome}`, message: "Segue o contrato para assinatura." },
      signers: [{ email: clienteEmail, action: "SIGN" }],
      file: null,
    },
  };
  const map = { "0": ["variables.file"] };

  const form = new FormData();
  form.append("operations", JSON.stringify(operations));
  form.append("map", JSON.stringify(map));
  form.append("0", new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }), `contrato-${clienteId}.pdf`);

  // Sem timeout, uma API travada deixaria a Server Action pendurada indefinidamente.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  let res: Response;
  try {
    res = await fetch(AUTENTIQUE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("A Autentique demorou demais para responder. Tente novamente em instantes.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`A Autentique não respondeu corretamente (status ${res.status}). Tente novamente em instantes.`);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("A Autentique retornou uma resposta inesperada. Tente novamente em instantes.");
  }

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "Não foi possível enviar o contrato para assinatura");
  }

  return json.data.createDocument.id as string;
}
