import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContratoPdf } from "@/lib/pdf/contrato-pdf";
import { valorPorExtenso } from "@/lib/numero-extenso";

export async function GET() {
  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const pdfBuffer = await renderToBuffer(
    ContratoPdf({
      clienteNome: "Fulano de Tal",
      clienteCpfCnpj: "000.000.000-00",
      clienteCidadeUf: "Pelotas/RS",
      valorFormatado: "597,00",
      valorExtenso: valorPorExtenso(597),
      data: dataExtenso,
    }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="modelo-contrato-espectra.pdf"',
    },
  });
}
