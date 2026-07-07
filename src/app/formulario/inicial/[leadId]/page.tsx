import { notFound } from "next/navigation";
import { BriefingInicialForm } from "@/components/briefing-inicial/briefing-inicial-form";
import { getLeadForPrefill } from "@/lib/data/leads";
import { DEMO_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function FormularioInicialPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  if (leadId === DEMO_ID) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-lg">
          <BriefingInicialForm leadId={DEMO_ID} nomeInicial="" demo />
        </div>
      </main>
    );
  }

  const lead = await getLeadForPrefill(leadId);
  if (!lead) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <BriefingInicialForm leadId={lead.id} nomeInicial={lead.nome} />
      </div>
    </main>
  );
}
