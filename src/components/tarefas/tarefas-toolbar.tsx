"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Plus, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORIDADE_TAREFA_CONFIG } from "@/lib/constants";
import { TarefaFormDialog } from "@/components/tarefas/tarefa-form-dialog";
import { cn } from "@/lib/utils";
import type { Cliente, MembroEquipe } from "@/generated/prisma/client";

export function TarefasToolbar({
  search,
  responsavelId,
  prioridade,
  view,
  membros,
  clientes,
}: {
  search: string;
  responsavelId: string;
  prioridade: string;
  view: string;
  membros: MembroEquipe[];
  clientes: Cliente[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [searchValue, setSearchValue] = useState(search);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos" && value !== "todas" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateParam("q", searchValue)}
              onBlur={() => updateParam("q", searchValue)}
            />
          </div>

          <Select value={responsavelId || "todos"} onValueChange={(v) => updateParam("responsavel", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Responsável">
                {(value: string) =>
                  value === "todos"
                    ? "Todos os responsáveis"
                    : (membros.find((m) => m.id === value)?.nome ?? "Responsável")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              {membros.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={prioridade || "todas"} onValueChange={(v) => updateParam("prioridade", v ?? "")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Prioridade">
                {(value: string) =>
                  value === "todas"
                    ? "Todas as prioridades"
                    : (PRIORIDADE_TAREFA_CONFIG[value as keyof typeof PRIORIDADE_TAREFA_CONFIG]?.label ??
                      "Prioridade")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as prioridades</SelectItem>
              {Object.entries(PRIORIDADE_TAREFA_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => updateParam("view", "kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                view !== "lista" && "bg-accent text-accent-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" /> Kanban
            </button>
            <button
              onClick={() => updateParam("view", "lista")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                view === "lista" && "bg-accent text-accent-foreground",
              )}
            >
              <List className="size-3.5" /> Lista
            </button>
          </div>

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="size-4" />
            Nova tarefa
          </Button>
        </div>
      </div>

      <TarefaFormDialog open={openCreate} onOpenChange={setOpenCreate} membros={membros} clientes={clientes} />
    </>
  );
}
