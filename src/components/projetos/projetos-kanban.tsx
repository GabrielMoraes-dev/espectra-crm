"use client";

import { useEffect, useState } from "react";
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
import { CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProjetoDetailSheet } from "@/components/projetos/projeto-detail-sheet";
import { ETAPA_PROJETO_CONFIG, ETAPA_PROJETO_ORDEM } from "@/lib/constants";
import { formatDataPrazo, getPrazoUrgencia, initials, cn } from "@/lib/utils";
import { moveProjetoEtapa } from "@/lib/actions/projeto-actions";
import type { Cliente, FotoCliente, MembroEquipe, Projeto } from "@/generated/prisma/client";

type ProjetoCompleto = Projeto & { cliente: Cliente & { fotos: FotoCliente[] }; responsavel: MembroEquipe | null };

function ProjetoCard({ projeto, onOpen }: { projeto: ProjetoCompleto; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: projeto.id });
  const urgencia = projeto.status !== "PUBLICADO" ? getPrazoUrgencia(projeto.prazo) : null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={cn(
        "group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:border-brand-500/40 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="size-7">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-[11px]">
            {initials(projeto.cliente.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{projeto.cliente.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{projeto.cliente.empresa}</p>
        </div>
      </div>
      {projeto.prazo && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3" /> {formatDataPrazo(projeto.prazo)}
          </p>
          {urgencia && <StatusBadge label={urgencia.label} className={urgencia.className} />}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  etapa,
  count,
  children,
}: {
  etapa: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const config = ETAPA_PROJETO_CONFIG[etapa as keyof typeof ETAPA_PROJETO_CONFIG];

  return (
    <div className="flex w-64 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{count}</span>
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

export function ProjetosKanban({
  projetos: initialProjetos,
  clientes,
  membros,
}: {
  projetos: ProjetoCompleto[];
  clientes: Cliente[];
  membros: MembroEquipe[];
}) {
  const [projetos, setProjetos] = useState(initialProjetos);
  const [activeProjeto, setActiveProjeto] = useState<ProjetoCompleto | null>(null);
  const [selectedProjeto, setSelectedProjeto] = useState<ProjetoCompleto | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncs optimistic local state when the server-fetched list changes
    setProjetos(initialProjetos);
  }, [initialProjetos]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveProjeto(projetos.find((p) => p.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProjeto(null);
    const { active, over } = event;
    if (!over) return;
    const novaEtapa = over.id as string;
    const projeto = projetos.find((p) => p.id === active.id);
    if (!projeto || projeto.status === novaEtapa) return;

    setProjetos((prev) =>
      prev.map((p) => (p.id === projeto.id ? { ...p, status: novaEtapa as Projeto["status"] } : p)),
    );

    moveProjetoEtapa(projeto.id, novaEtapa as never).catch(() => {
      toast.error("Não foi possível mover o projeto");
      setProjetos((prev) => prev.map((p) => (p.id === projeto.id ? { ...p, status: projeto.status } : p)));
    });
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {ETAPA_PROJETO_ORDEM.map((etapa) => {
            const projetosDaEtapa = projetos.filter((p) => p.status === etapa);
            return (
              <KanbanColumn key={etapa} etapa={etapa} count={projetosDaEtapa.length}>
                {projetosDaEtapa.map((projeto) => (
                  <ProjetoCard
                    key={projeto.id}
                    projeto={projeto}
                    onOpen={() => setSelectedProjeto(projeto)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeProjeto && (
            <div className="w-64 rounded-xl border border-brand-500/60 bg-card p-3 shadow-lg">
              <p className="truncate text-sm font-medium text-foreground">{activeProjeto.cliente.nome}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
