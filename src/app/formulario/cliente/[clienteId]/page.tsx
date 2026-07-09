import { BriefingForm } from "@/components/briefing/briefing-form";
import { getClienteForPrefill } from "@/lib/data/clientes";

export const dynamic = "force-dynamic";

export default async function FormularioClientePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = await getClienteForPrefill(clienteId);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl pb-24">
        <BriefingForm
          initialData={
            cliente
              ? {
                  clienteId: cliente.id,
                  nome: cliente.nome,
                  whatsapp: cliente.whatsapp,
                  instagram: cliente.instagram,
                  email: cliente.email,
                  cidade: cliente.cidade,
                  estado: cliente.estado,
                  nicho: cliente.nicho,
                  nomeInicial: cliente.nomeInicial,
                  profissaoInicial: cliente.profissaoInicial,
                  apresentacao: cliente.apresentacaoInicial,
                  fotosUrls: cliente.fotosUrlsIniciais,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
