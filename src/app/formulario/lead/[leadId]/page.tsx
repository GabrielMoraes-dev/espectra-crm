import { BriefingForm } from "@/components/briefing/briefing-form";
import { getLeadForPrefill } from "@/lib/data/leads";
import { DEMO_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function FormularioLeadPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  if (leadId === DEMO_ID) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-2xl pb-24">
          <BriefingForm demo />
        </div>
      </main>
    );
  }

  const lead = await getLeadForPrefill(leadId);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl pb-24">
        <BriefingForm
          initialData={
            lead
              ? {
                  leadId: lead.id,
                  nome: lead.nome,
                  empresa: lead.empresa,
                  whatsapp: lead.whatsapp,
                  instagram: lead.instagram,
                  email: lead.email,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
