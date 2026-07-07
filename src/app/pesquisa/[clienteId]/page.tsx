import { notFound } from "next/navigation";
import { getClienteForPesquisa } from "@/lib/data/clientes";
import { PesquisaPageContent } from "@/components/pesquisa/pesquisa-page-content";
import { DEMO_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PesquisaPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  if (clienteId === DEMO_ID) {
    return (
      <main className="min-h-screen bg-background">
        <PesquisaPageContent clienteId={DEMO_ID} nome="" demo />
      </main>
    );
  }

  const cliente = await getClienteForPesquisa(clienteId);
  if (!cliente) notFound();

  return (
    <main className="min-h-screen bg-background">
      <PesquisaPageContent clienteId={cliente.id} nome={cliente.nome} />
    </main>
  );
}
