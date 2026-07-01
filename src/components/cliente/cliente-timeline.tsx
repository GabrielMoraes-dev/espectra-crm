"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AddTimelineEventDialog } from "@/components/cliente/add-timeline-event-dialog";
import { formatDateLong } from "@/lib/utils";
import { deleteTimelineEvent } from "@/lib/actions/cliente-actions";
import type { TimelineEvent } from "@/generated/prisma/client";

export function ClienteTimeline({
  clienteId,
  events,
}: {
  clienteId: string;
  events: TimelineEvent[];
}) {
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">Timeline do projeto</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpenAdd(true)}>
          <Plus className="size-3.5" /> Evento
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState icon={History} title="Nenhum evento registrado ainda" />
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-5">
            {events.map((event) => (
              <li key={event.id} className="group relative">
                <span className="absolute -left-[25px] top-1 size-2.5 rounded-full border-2 border-background bg-brand-500" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDateLong(event.data)}</p>
                    <p className="text-sm font-medium text-foreground">{event.titulo}</p>
                    {event.descricao && (
                      <p className="text-sm text-muted-foreground">{event.descricao}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await deleteTimelineEvent(event.id, clienteId);
                      toast.success("Evento removido");
                    }}
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>

      <AddTimelineEventDialog open={openAdd} onOpenChange={setOpenAdd} clienteId={clienteId} />
    </Card>
  );
}
