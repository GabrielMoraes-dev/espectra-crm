import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getIpFromRequest, verificarRateLimit } from "@/lib/rate-limit";

// SVG fica de fora: pode embutir script e esse endpoint recebe upload do formulário público, sem login.
// HEIC/HEIF: formato padrão de fotos do iPhone quando escolhidas da galeria (não da câmera).
const TIPOS_IMAGEM = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/heic", "image/heif"];
// Padrão (sem clientPayload "geral"): fotos, logo e PDFs — cobre os uploads de
// imagem/documento avulsos do CRM (foto de perfil, contrato, etc.).
const TIPOS_PADRAO = [...TIPOS_IMAGEM, "application/pdf"];
// Só quando o campo explicitamente permite vídeo (Depoimentos, Demais arquivos
// no briefing completo) — arquivo pode ser bem maior.
const TIPOS_GERAL = [...TIPOS_PADRAO, "video/mp4", "video/quicktime", "video/webm"];

const LIMITE_PADRAO = 20 * 1024 * 1024;
const LIMITE_GERAL = 1024 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await verificarRateLimit("blob_upload", getIpFromRequest(request), 40, 15 * 60 * 1000);
  } catch {
    return NextResponse.json({ error: "Muitos uploads vindos do seu endereço. Tente novamente mais tarde." }, { status: 429 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let permiteVideo = false;
        try {
          permiteVideo = clientPayload ? JSON.parse(clientPayload).tipo === "geral" : false;
        } catch {
          permiteVideo = false;
        }

        return {
          addRandomSuffix: false,
          allowedContentTypes: permiteVideo ? TIPOS_GERAL : TIPOS_PADRAO,
          maximumSizeInBytes: permiteVideo ? LIMITE_GERAL : LIMITE_PADRAO,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[blob-upload]", error instanceof Error ? error.stack ?? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao autorizar upload" },
      { status: 400 },
    );
  }
}
