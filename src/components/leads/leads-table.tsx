"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { ETAPA_LEAD_CONFIG } from "@/lib/constants";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import type { MembroEquipe } from "@/generated/prisma/client";
import type { LeadComBriefing } from "@/lib/data/leads";

export function LeadsTable({
  leads,
  membros,
}: {
  leads: LeadComBriefing[];
  membros: MembroEquipe[];
}) {
  const [selectedLead, setSelectedLead] = useState<LeadComBriefing | null>(null);

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nenhum lead encontrado"
        description="Ajuste os filtros ou cadastre um novo lead para começar."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Origem</TableHead>
              <TableHead className="hidden sm:table-cell">Valor estimado</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="hidden lg:table-cell">Última interação</TableHead>
              <TableHead className="hidden lg:table-cell">Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const etapaConfig = ETAPA_LEAD_CONFIG[lead.etapa];
              return (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{lead.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {lead.empresa ?? lead.email ?? lead.whatsapp ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {lead.origem ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {formatCurrency(lead.valorEstimado)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={etapaConfig.label} className={etapaConfig.className} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {lead.ultimaInteracaoEm ? timeAgo(lead.ultimaInteracaoEm) : `${timeAgo(lead.etapaAlteradaEm)} nesta etapa`}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(o) => !o && setSelectedLead(null)}
        membros={membros}
      />
    </>
  );
}
