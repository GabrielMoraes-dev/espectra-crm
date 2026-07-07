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
import { PagamentoFormDialog } from "@/components/financeiro/pagamento-form-dialog";
import type { Cliente } from "@/generated/prisma/client";

export function FinanceiroToolbar({
  search,
  status,
  sort,
  clientes,
}: {
  search: string;
  status: string;
  sort: string;
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
              placeholder="Buscar por cliente..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateParam("q", searchValue)}
              onBlur={() => updateParam("q", searchValue)}
            />
          </div>

          <Select value={status || "todos"} onValueChange={(v) => updateParam("status", v ?? "")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status">
                {(value: string) =>
                  ({ todos: "Todos", pago: "Pago", pendente: "Pendente" })[value] ?? "Status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort || "recentes"} onValueChange={(v) => updateParam("sort", v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Ordenar">
                {(value: string) =>
                  ({
                    recentes: "Mais recentes",
                    antigos: "Mais antigos",
                    "maior-valor": "Maior valor",
                    "menor-valor": "Menor valor",
                  })[value] ?? "Ordenar"
                }
              </SelectValue>
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
          Novo pagamento
        </Button>
      </div>

      <PagamentoFormDialog open={openCreate} onOpenChange={setOpenCreate} clientes={clientes} />
    </>
  );
}
