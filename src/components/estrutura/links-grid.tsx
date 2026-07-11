"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import * as Icons from "lucide-react";
import { ExternalLink, Link2, MoreHorizontal, Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LinkFormDialog } from "@/components/estrutura/link-form-dialog";
import { LINK_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { deleteLinkInterno, reordenarLinksInternos } from "@/lib/actions/link-actions";
import type { LinkInterno } from "@/generated/prisma/client";

function LinkIcon({ icone }: { icone: string | null }) {
  if (icone?.startsWith("http")) {
    return (
      <div className="relative size-5 shrink-0">
        <Image src={icone} alt="" fill sizes="20px" className="object-contain" />
      </div>
    );
  }
  const name = icone ? LINK_ICON_MAP[icone] : null;
  const Comp = name ? (Icons as unknown as Record<string, Icons.LucideIcon>)[name] : Link2;
  return <Comp className="size-4" />;
}

function SortableLinkCard({
  link,
  onEdit,
  onDelete,
}: {
  link: LinkInterno;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5",
        isDragging && "z-10 opacity-60 shadow-lg",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2.5"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
          <LinkIcon icone={link.icone} />
        </div>
        <span className="truncate text-sm font-medium text-foreground">{link.nome}</span>
        <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <MoreHorizontal className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-3.5" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function LinksGrid({ links: initialLinks }: { links: LinkInterno[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [openCreate, setOpenCreate] = useState(false);
  const [editLink, setEditLink] = useState<LinkInterno | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkInterno | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncs local order when the server list changes (create/edit/delete)
    setLinks(initialLinks);
  }, [initialLinks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordenados = arrayMove(links, oldIndex, newIndex);
    setLinks(reordenados);

    reordenarLinksInternos(reordenados.map((l) => l.id)).catch(() => {
      toast.error("Não foi possível salvar a nova ordem");
      setLinks(links);
    });
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">Links Internos</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpenCreate(true)}>
          <Plus className="size-3.5" /> Link
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={rectSortingStrategy}>
            {links.map((link) => (
              <SortableLinkCard
                key={link.id}
                link={link}
                onEdit={() => setEditLink(link)}
                onDelete={() => setDeleteTarget(link)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>

      <LinkFormDialog open={openCreate} onOpenChange={setOpenCreate} />
      <LinkFormDialog open={!!editLink} onOpenChange={(o) => !o && setEditLink(null)} link={editLink} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Remover "${deleteTarget?.nome}"?`}
        confirmLabel="Remover"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteLinkInterno(deleteTarget.id);
          toast.success("Link removido");
        }}
      />
    </Card>
  );
}
