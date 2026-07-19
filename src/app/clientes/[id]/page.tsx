import { notFound } from "next/navigation";
import { ClienteHeader } from "@/components/cliente/cliente-header";
import { ClienteInfoGrid } from "@/components/cliente/cliente-info-grid";
import { ClienteTarefas } from "@/components/cliente/cliente-tarefas";
import { ClienteTimeline } from "@/components/cliente/cliente-timeline";
import { ClienteBriefing } from "@/components/cliente/cliente-briefing";
import { ClienteSideCards } from "@/components/cliente/cliente-side-cards";
import { FadeIn } from "@/components/shared/fade-in";
import { getClienteById } from "@/lib/data/clientes";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, membros, clientes] = await Promise.all([
    getClienteById(id),
    prisma.membroEquipe.findMany({ orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" } }),
  ]);

  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      <FadeIn>
        <ClienteHeader cliente={cliente} membros={membros} leadId={cliente.lead?.id} />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FadeIn delay={0.05}>
            <ClienteInfoGrid cliente={cliente} />
          </FadeIn>
          <FadeIn delay={0.08}>
            <ClienteTarefas
              clienteId={cliente.id}
              tarefas={cliente.tarefas}
              membros={membros}
              clientes={clientes}
            />
          </FadeIn>
          <FadeIn delay={0.11}>
            <ClienteTimeline clienteId={cliente.id} events={cliente.timeline} />
          </FadeIn>
          <FadeIn delay={0.13}>
            <ClienteBriefing
              briefings={cliente.briefings}
              briefingInicial={cliente.lead?.briefingsIniciais[0]}
            />
          </FadeIn>
        </div>

        <FadeIn delay={0.16}>
          <ClienteSideCards
            clienteId={cliente.id}
            projetos={cliente.projetos}
            pagamentos={cliente.pagamentos}
            pesquisas={cliente.pesquisas}
            membros={membros}
            cpfCnpj={cliente.cpfCnpj}
            contratoAutentiqueId={cliente.contratoAutentiqueId}
            contratoUrl={cliente.contratoUrl}
          />
        </FadeIn>
      </div>
    </div>
  );
}
