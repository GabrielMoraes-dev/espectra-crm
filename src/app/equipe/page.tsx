import { PageHeader } from "@/components/shared/page-header";
import { EquipeToolbar } from "@/components/equipe/equipe-toolbar";
import { MembroCard } from "@/components/equipe/membro-card";
import { FadeInStagger } from "@/components/shared/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { UserSquare2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const [membros, projetosAtivos] = await Promise.all([
    prisma.membroEquipe.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.projeto.findMany({
      where: { status: { not: "PUBLICADO" }, responsavelId: { not: null } },
      include: { cliente: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        description="Quem faz a Espectra funcionar, dia a dia."
        actions={<EquipeToolbar />}
      />

      {membros.length === 0 ? (
        <EmptyState icon={UserSquare2} title="Nenhum membro cadastrado ainda" />
      ) : (
        <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {membros.map((membro) => (
            <MembroCard
              key={membro.id}
              membro={membro}
              projetosAtivos={projetosAtivos.filter((p) => p.responsavelId === membro.id)}
            />
          ))}
        </FadeInStagger>
      )}
    </div>
  );
}
