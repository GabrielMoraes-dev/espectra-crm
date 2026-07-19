"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, Inbox, Rocket, ListChecks, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buscarGlobal, type ResultadoBusca } from "@/lib/actions/busca-actions";

const ICONE_POR_TIPO = {
  lead: Inbox,
  cliente: Users,
  projeto: Rocket,
  tarefa: ListChecks,
} as const;

const LABEL_POR_TIPO = {
  lead: "Leads",
  cliente: "Clientes",
  projeto: "Projetos",
  tarefa: "Tarefas",
} as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarGlobal(query);
        setResultados(r);
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const resultadosExibidos = query.trim().length < 2 ? [] : resultados;

  const selecionar = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const grupos = (["lead", "cliente", "projeto", "tarefa"] as const)
    .map((tipo) => ({ tipo, itens: resultadosExibidos.filter((r) => r.tipo === tipo) }))
    .filter((g) => g.itens.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground sm:flex"
      >
        <Search className="size-3.5" />
        <span>Buscar...</span>
        <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar leads, clientes, projetos, tarefas..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim().length >= 2 && resultadosExibidos.length === 0 && (
            <CommandEmpty>Nada encontrado para &quot;{query}&quot;</CommandEmpty>
          )}
          {query.trim().length < 2 && (
            <CommandEmpty>Digite ao menos 2 letras para buscar.</CommandEmpty>
          )}
          {grupos.map(({ tipo, itens }) => {
            const Icon = ICONE_POR_TIPO[tipo];
            return (
              <CommandGroup key={tipo} heading={LABEL_POR_TIPO[tipo]}>
                {itens.map((item) => (
                  <CommandItem
                    key={`${item.tipo}-${item.id}`}
                    value={`${item.tipo}-${item.id}-${item.titulo}`}
                    onSelect={() => selecionar(item.href)}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate">{item.titulo}</p>
                      {item.subtitulo && (
                        <p className="truncate text-xs text-muted-foreground">{item.subtitulo}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
