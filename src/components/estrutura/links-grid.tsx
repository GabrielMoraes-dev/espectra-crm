"use client";

import { useState } from "react";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { ExternalLink, Link2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { deleteLinkInterno } from "@/lib/actions/link-actions";
import type { LinkInterno } from "@/generated/prisma/client";

function LinkIcon({ icone }: { icone: string | null }) {
  const name = icone ? LINK_ICON_MAP[icone] : null;
  const Comp = name ? (Icons as unknown as Record<string, Icons.LucideIcon>)[name] : Link2;
  return <Comp className="size-4" />;
}

export function LinksGrid({ links }: { links: LinkInterno[] }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editLink, setEditLink] = useState<LinkInterno | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkInterno | null>(null);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">Links Internos</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpenCreate(true)}>
          <Plus className="size-3.5" /> Link
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5"
          >
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
                <DropdownMenuItem onClick={() => setEditLink(link)}>
                  <Pencil className="size-3.5" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(link)}>
                  <Trash2 className="size-3.5" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
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
