"use client";

import { useEffect, useRef, useState } from "react";
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
import { CalendarClock, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { TarefaDetailSheet } from "@/components/tarefas/tarefa-detail-sheet";
import { PRIORIDADE_TAREFA_CONFIG, STATUS_TAREFA_CONFIG, STATUS_TAREFA_ORDEM } from "@/lib/constants";
import { formatDataPrazo, getPrazoUrgencia, initials, cn } from "@/lib/utils";
import { moveTarefaStatus } from "@/lib/actions/tarefa-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Cliente, MembroEquipe, Tarefa } from "@/generated/prisma/client";

type TarefaCompleta = Tarefa & { responsavel: MembroEquipe | null; cliente: Cliente | null };

function TarefaCard({
  tarefa,
  onClick,
}: {
  tarefa: TarefaCompleta;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: tarefa.id });
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);
  const prioridadeConfig = PRIORIDADE_TAREFA_CONFIG[tarefa.prioridade];
  const urgencia = tarefa.status !== "CONCLUIDA" ? getPrazoUrgencia(tarefa.prazo) : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => { pointerStart.current = { x: e.clientX, y: e.clientY }; didDrag.current = false; }}
      onPointerMove={(e) => {
        if (!pointerStart.current) return;
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 6) didDrag.current = true;
      }}
      onClick={() => { if (!didDrag.current) onClick(); }}
      className={cn(
        "group cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:border-border/80 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <p className="min-w-0 truncate text-sm font-medium text-foreground">{tarefa.titulo}</p>

      {tarefa.cliente && (
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <Building2 className="size-3 shrink-0" /> {tarefa.cliente.nome}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge label={prioridadeConfig.label} className={prioridadeConfig.className} />
        {tarefa.responsavel && (
          <Avatar className="size-6">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
              {initials(tarefa.responsavel.nome)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {tarefa.prazo && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3" /> {formatDataPrazo(tarefa.prazo)}
          </p>
          {urgencia && <StatusBadge label={urgencia.label} className={urgencia.className} />}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  count,
  children,
}: {
  status: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_TAREFA_CONFIG[status as keyof typeof STATUS_TAREFA_CONFIG];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
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

export function TarefasBoard({
  tarefas: initialTarefas,
  membros,
  clientes,
}: {
  tarefas: TarefaCompleta[];
  membros: MembroEquipe[];
  clientes: Cliente[];
}) {
  const [tarefas, setTarefas] = useState(initialTarefas);
  const [activeTarefa, setActiveTarefa] = useState<TarefaCompleta | null>(null);
  const [selected, setSelected] = useState<TarefaCompleta | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncs optimistic local state when the server-fetched list changes
    setTarefas(initialTarefas);
    // Keep the sheet in sync after a save revalidates the page
    setSelected((prev) => {
      if (!prev) return null;
      return initialTarefas.find((t) => t.id === prev.id) ?? null;
    });
  }, [initialTarefas]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveTarefa(tarefas.find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTarefa(null);
    const { active, over } = event;
    if (!over) return;
    const novoStatus = over.id as string;
    const tarefa = tarefas.find((t) => t.id === active.id);
    if (!tarefa || tarefa.status === novoStatus) return;

    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus as Tarefa["status"] } : t)),
    );

    moveTarefaStatus(tarefa.id, novoStatus as never).catch(() => {
      toast.error("Não foi possível mover a tarefa");
      setTarefas((prev) => prev.map((t) => (t.id === tarefa.id ? { ...t, status: tarefa.status } : t)));
    });
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {STATUS_TAREFA_ORDEM.map((status) => {
            const tarefasDoStatus = tarefas.filter((t) => t.status === status);
            return (
              <KanbanColumn key={status} status={status} count={tarefasDoStatus.length}>
                {tarefasDoStatus.map((tarefa) => (
                  <TarefaCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    onClick={() => setSelected(tarefa)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeTarefa && (
            <div className="w-72 rounded-xl border border-brand-500/60 bg-card p-3 shadow-lg">
              <p className="truncate text-sm font-medium text-foreground">{activeTarefa.titulo}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TarefaDetailSheet
        tarefa={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        membros={membros}
        clientes={clientes}
      />
    </>
  );
}
