import { notFound } from "next/navigation";
import { getClienteForPesquisa } from "@/lib/data/clientes";
import { PesquisaPageContent } from "@/components/pesquisa/pesquisa-page-content";

export const dynamic = "force-dynamic";

export default async function PesquisaPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = await getClienteForPesquisa(clienteId);
  if (!cliente) notFound();

  return (
    <main className="min-h-screen bg-background">
      <PesquisaPageContent clienteId={cliente.id} nome={cliente.nome} />
    </main>
  );
}
