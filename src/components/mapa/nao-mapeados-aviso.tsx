"use client";

import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NaoMapeadosAviso({
  clientes,
}: {
  clientes: { id: string; nome: string; cidade: string | null; estado: string | null }[];
}) {
  if (clientes.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-warning/20 px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/30"
          />
        }
      >
        <MapPinOff className="size-3.5" />
        {clientes.length} sem localização reconhecida
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px]">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Cidade/estado não reconhecido no mapa
        </p>
        <ul className="space-y-1">
          {clientes.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clientes/${c.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-sm text-foreground hover:bg-accent"
              >
                <span className="truncate">{c.nome}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {[c.cidade, c.estado].filter(Boolean).join(", ") || "sem cidade"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
