"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_CLIENTE_CONFIG, NICHOS_CLIENTE } from "@/lib/constants";
import { ClienteFormDialog } from "@/components/clientes/cliente-form-dialog";
import type { MembroEquipe } from "@/generated/prisma/client";

export function ClientesToolbar({
  search,
  status,
  nicho,
  sort,
  membros,
}: {
  search: string;
  status: string;
  nicho: string;
  sort: string;
  membros: MembroEquipe[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [searchValue, setSearchValue] = useState(search);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos" && value !== "") {
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
              onKeyDown={(e) => e.key === "Enter" && updateParam("q", searchValue)}
              onBlur={() => updateParam("q", searchValue)}
            />
          </div>

          <Select value={status || "todos"} onValueChange={(v) => updateParam("status", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_CLIENTE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={nicho || "todos"} onValueChange={(v) => updateParam("nicho", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Nicho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os nichos</SelectItem>
              {NICHOS_CLIENTE.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
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

        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </div>

      <ClienteFormDialog open={openCreate} onOpenChange={setOpenCreate} membros={membros} />
    </>
  );
}
