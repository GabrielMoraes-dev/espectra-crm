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
import { ORIGENS_LEAD } from "@/lib/constants";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { cn } from "@/lib/utils";

export function LeadsToolbar({
  search,
  origem,
  sort,
  view,
}: {
  search: string;
  origem: string;
  sort: string;
  view: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [searchValue, setSearchValue] = useState(search);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todas" && value !== "") {
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
              placeholder="Buscar por nome, empresa ou email..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParam("q", searchValue);
              }}
              onBlur={() => updateParam("q", searchValue)}
            />
          </div>

          <Select value={origem || "todas"} onValueChange={(v) => updateParam("origem", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as origens</SelectItem>
              {ORIGENS_LEAD.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort || "recentes"} onValueChange={(v) => updateParam("sort", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="antigos">Mais antigos</SelectItem>
              <SelectItem value="maior-valor">Maior valor</SelectItem>
              <SelectItem value="menor-valor">Menor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => updateParam("view", "table")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                view !== "kanban" && "bg-accent text-accent-foreground",
              )}
            >
              <List className="size-3.5" /> Tabela
            </button>
            <button
              onClick={() => updateParam("view", "kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                view === "kanban" && "bg-accent text-accent-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" /> Kanban
            </button>
          </div>

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="size-4" />
            Nova lead
          </Button>
        </div>
      </div>

      <LeadFormDialog open={openCreate} onOpenChange={setOpenCreate} />
    </>
  );
}
