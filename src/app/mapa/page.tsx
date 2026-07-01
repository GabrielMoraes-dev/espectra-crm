import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { MapaWrapper } from "@/components/mapa/mapa-wrapper";
import { prisma } from "@/lib/prisma";
import { getCoords } from "@/lib/geo";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nome: true, empresa: true, cidade: true, estado: true },
    orderBy: { nome: "asc" },
  });

  const clientesComCoords = clientes
    .map((c) => {
      const coords = getCoords(c.cidade, c.estado);
      if (!coords) return null;
      return { ...c, coords };
    })
    .filter(Boolean) as {
    id: string;
    nome: string;
    empresa: string | null;
    cidade: string | null;
    estado: string | null;
    coords: [number, number];
  }[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa de clientes"
        description={`${clientesComCoords.length} cliente${clientesComCoords.length !== 1 ? "s" : ""} mapeado${clientesComCoords.length !== 1 ? "s" : ""} — todos conectados à Espectra em Pelotas.`}
      />
      <FadeIn>
        <MapaWrapper clientes={clientesComCoords} />
      </FadeIn>
    </div>
  );
}
