"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Rocket, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjetoFormDialog } from "@/components/projetos/projeto-form-dialog";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { formatDataPrazo } from "@/lib/utils";
import type { MembroEquipe, Projeto } from "@/generated/prisma/client";

export function ClienteProjetoCard({
  clienteId,
  projetos,
  membros,
}: {
  clienteId: string;
  projetos: Projeto[];
  membros: MembroEquipe[];
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editProjeto, setEditProjeto] = useState<Projeto | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Projeto</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpenCreate(true)}>
            <Plus className="size-4" />
            Novo
          </Button>
        </CardHeader>
        <CardContent>
          {projetos.length === 0 ? (
            <EmptyState icon={Rocket} title="Nenhum projeto vinculado" />
          ) : (
            <div className="space-y-3">
              {projetos.map((projeto) => {
                const config = ETAPA_PROJETO_CONFIG[projeto.status];
                return (
                  <div key={projeto.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium text-foreground">{formatDataPrazo(projeto.prazo)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={config.label} className={config.className} />
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditProjeto(projeto)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Link href="/projetos" className="block text-xs font-medium text-brand-100 hover:underline">
                Ver no quadro de projetos →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <ProjetoFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        membros={membros}
        clienteIdFixo={clienteId}
      />
      <ProjetoFormDialog
        open={!!editProjeto}
        onOpenChange={(o) => !o && setEditProjeto(null)}
        projeto={editProjeto}
        membros={membros}
        clienteIdFixo={clienteId}
      />
    </>
  );
}
