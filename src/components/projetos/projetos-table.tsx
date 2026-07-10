"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjetoDetailSheet } from "@/components/projetos/projeto-detail-sheet";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { formatDataPrazo, initials } from "@/lib/utils";
import type { Cliente, FotoCliente, MembroEquipe, Projeto } from "@/generated/prisma/client";

type ProjetoCompleto = Projeto & { cliente: Cliente & { fotos: FotoCliente[] }; responsavel: MembroEquipe | null };

export function ProjetosTable({
  projetos,
  clientes,
  membros,
}: {
  projetos: ProjetoCompleto[];
  clientes: Cliente[];
  membros: MembroEquipe[];
}) {
  const [selectedProjeto, setSelectedProjeto] = useState<ProjetoCompleto | null>(null);

  if (projetos.length === 0) {
    return (
      <EmptyState icon={Rocket} title="Nenhum projeto encontrado" description="Ajuste os filtros ou crie um novo projeto." />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Prazo</TableHead>
              <TableHead className="hidden lg:table-cell">Responsável</TableHead>
              <TableHead>Etapa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetos.map((projeto) => {
              const config = ETAPA_PROJETO_CONFIG[projeto.status];
              return (
                <TableRow
                  key={projeto.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedProjeto(projeto)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {initials(projeto.cliente.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{projeto.cliente.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">{projeto.cliente.empresa}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDataPrazo(projeto.prazo)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {projeto.responsavel?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={config.label} className={config.className} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProjetoDetailSheet
        projeto={selectedProjeto}
        open={!!selectedProjeto}
        onOpenChange={(o) => !o && setSelectedProjeto(null)}
        clientes={clientes}
        membros={membros}
      />
    </>
  );
}
