"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { ETAPA_LEAD_CONFIG, ETAPA_LEAD_ORDEM } from "@/lib/constants";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { moveLeadEtapa } from "@/lib/actions/lead-actions";
import type { Lead, MembroEquipe } from "@/generated/prisma/client";
import type { LeadComBriefing } from "@/lib/data/leads";

function LeadCard({
  lead,
  onOpen,
  movendo,
}: {
  lead: LeadComBriefing;
  onOpen: () => void;
  movendo: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    disabled: movendo,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={cn(
        "group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:border-brand-500/40 active:cursor-grabbing",
        isDragging && "opacity-40",
        movendo && "cursor-wait opacity-60",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{lead.nome}</p>
        {lead.empresa && (
          <p className="truncate text-xs text-muted-foreground">{lead.empresa}</p>
        )}
      </div>
      {lead.valorEstimado != null && (
        <p className="mt-2 text-xs font-medium text-brand-100">
          {formatCurrency(lead.valorEstimado)}
        </p>
      )}
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {lead.ultimaInteracaoEm
          ? `Contato ${timeAgo(lead.ultimaInteracaoEm)}`
          : `Nesta etapa ${timeAgo(lead.etapaAlteradaEm)}`}
      </p>
    </div>
  );
}

function KanbanColumn({
  etapa,
  leads,
  children,
}: {
  etapa: string;
  leads: LeadComBriefing[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const config = ETAPA_LEAD_CONFIG[etapa as keyof typeof ETAPA_LEAD_CONFIG];

  return (
    <div className="flex w-64 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/70 p-2 transition-colors",
          isOver && "border-brand-500/60 bg-accent/40",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function LeadsKanban({
  leads: initialLeads,
  membros,
}: {
  leads: LeadComBriefing[];
  membros: MembroEquipe[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [activeLead, setActiveLead] = useState<LeadComBriefing | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadComBriefing | null>(null);
  // Leads com uma chamada moveLeadEtapa em andamento — bloqueia um segundo
  // drag do mesmo lead antes do primeiro terminar, evitando que dois drags
  // rápidos em sequência cheguem fora de ordem no servidor.
  const [movendoIds, setMovendoIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncs optimistic local state when the server-fetched list changes
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;
    const novaEtapa = over.id as string;
    const lead = leads.find((l) => l.id === active.id);
    if (!lead || lead.etapa === novaEtapa || movendoIds.has(lead.id)) return;

    const etapaAnterior = lead.etapa;

    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, etapa: novaEtapa as Lead["etapa"] } : l)),
    );
    setMovendoIds((prev) => new Set(prev).add(lead.id));

    moveLeadEtapa(lead.id, etapaAnterior, novaEtapa as never)
      .then((result) => {
        if (!result.ok) {
          toast.error("Esse lead foi alterado em outro lugar — atualizando a lista");
          router.refresh();
        }
      })
      .catch(() => {
        toast.error("Não foi possível mover o lead");
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, etapa: etapaAnterior } : l)),
        );
      })
      .finally(() => {
        setMovendoIds((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
      });
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {ETAPA_LEAD_ORDEM.map((etapa) => {
            const leadsDaEtapa = leads.filter((l) => l.etapa === etapa);
            return (
              <KanbanColumn key={etapa} etapa={etapa} leads={leadsDaEtapa}>
                {leadsDaEtapa.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={() => setSelectedLead(lead)}
                    movendo={movendoIds.has(lead.id)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeLead && (
            <div className="w-64 rounded-xl border border-brand-500/60 bg-card p-3 shadow-lg">
              <p className="truncate text-sm font-medium text-foreground">{activeLead.nome}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(o) => !o && setSelectedLead(null)}
        membros={membros}
      />
    </>
  );
}
