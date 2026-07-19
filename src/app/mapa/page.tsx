import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { MapaWrapper } from "@/components/mapa/mapa-wrapper";
import { NaoMapeadosAviso } from "@/components/mapa/nao-mapeados-aviso";
import { prisma } from "@/lib/prisma";
import { getCoords, type Precisao } from "@/lib/geo";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const clientes = await prisma.cliente.findMany({
    where: { deletedAt: null },
    select: { id: true, nome: true, empresa: true, cidade: true, estado: true },
    orderBy: { nome: "asc" },
  });

  const clientesComCoords = clientes
    .map((c) => {
      const resultado = getCoords(c.cidade, c.estado);
      if (!resultado) return null;
      return { ...c, coords: resultado.coords, precisao: resultado.precisao };
    })
    .filter(Boolean) as {
    id: string;
    nome: string;
    empresa: string | null;
    cidade: string | null;
    estado: string | null;
    coords: [number, number];
    precisao: Precisao;
  }[];

  const idsComCoords = new Set(clientesComCoords.map((c) => c.id));
  const naoMapeados = clientes.filter((c) => !idsComCoords.has(c.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa de clientes"
        description={`${clientesComCoords.length} cliente${clientesComCoords.length !== 1 ? "s" : ""} mapeado${clientesComCoords.length !== 1 ? "s" : ""} — todos conectados à Espectra em Pelotas.`}
        actions={<NaoMapeadosAviso clientes={naoMapeados} />}
      />
      <FadeIn>
        <MapaWrapper clientes={clientesComCoords} />
      </FadeIn>
    </div>
  );
}
