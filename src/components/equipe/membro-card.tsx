"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Phone, Mail, MoreHorizontal, Pencil, Trash2, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MembroFormDialog } from "@/components/equipe/membro-form-dialog";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { initials, parseResponsabilidades, cn } from "@/lib/utils";
import { deleteMembro } from "@/lib/actions/membro-actions";
import type { Cliente, MembroEquipe, Projeto } from "@/generated/prisma/client";

const NIVEIS_CARGA = [
  { max: 1, label: "Tranquilo", cor: "bg-success" },
  { max: 3, label: "Moderado", cor: "bg-warning" },
  { max: Infinity, label: "Sobrecarregado", cor: "bg-destructive" },
];

function CargaTermometro({ projetos }: { projetos: (Projeto & { cliente: Cliente })[] }) {
  const total = projetos.length;
  const nivel = NIVEIS_CARGA.find((n) => total <= n.max) ?? NIVEIS_CARGA[NIVEIS_CARGA.length - 1];
  const blocos = 5;
  const preenchidos = Math.min(total, blocos);

  return (
    <Popover>
      <PopoverTrigger
        render={<button type="button" className="w-full text-left" />}
      >
        <div className="flex items-center gap-2">
          <Flame className={cn("size-3.5 shrink-0", total === 0 ? "text-muted-foreground" : nivel.cor.replace("bg-", "text-"))} />
          <div className="flex flex-1 gap-1">
            {Array.from({ length: blocos }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-muted",
                  i < preenchidos && nivel.cor,
                )}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {total} projeto{total !== 1 ? "s" : ""}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px]">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {total === 0 ? "Nenhum projeto em andamento" : `${nivel.label} — projetos em andamento`}
        </p>
        {total > 0 && (
          <ul className="space-y-1">
            {projetos.map((projeto) => (
              <li key={projeto.id}>
                <Link
                  href={`/clientes/${projeto.cliente.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-sm text-foreground hover:bg-accent"
                >
                  <span className="truncate">{projeto.cliente.nome}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {ETAPA_PROJETO_CONFIG[projeto.status].label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function MembroCard({
  membro,
  projetosAtivos,
}: {
  membro: MembroEquipe;
  projetosAtivos: (Projeto & { cliente: Cliente })[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const responsabilidades = parseResponsabilidades(membro.responsabilidades);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {membro.foto ? (
                <Image src={membro.foto} alt={membro.nome} fill className="object-cover" />
              ) : (
                initials(membro.nome)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{membro.nome}</p>
              <p className="text-xs text-muted-foreground">{membro.cargo}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <Pencil className="size-3.5" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CargaTermometro projetos={projetosAtivos} />

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {membro.telefone && (
            <p className="flex items-center gap-2"><Phone className="size-3.5" /> {membro.telefone}</p>
          )}
          {membro.email && (
            <p className="flex items-center gap-2"><Mail className="size-3.5" /> {membro.email}</p>
          )}
        </div>

        {responsabilidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {responsabilidades.map((r) => (
              <span
                key={r}
                className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <MembroFormDialog open={openEdit} onOpenChange={setOpenEdit} membro={membro} />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Remover ${membro.nome}?`}
        description="Tarefas, clientes e projetos vinculados ficarão sem responsável."
        confirmLabel="Remover"
        onConfirm={async () => {
          await deleteMembro(membro.id);
          toast.success("Membro removido");
        }}
      />
    </Card>
  );
}
