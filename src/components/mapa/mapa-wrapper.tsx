"use client";

import dynamic from "next/dynamic";
import type { Precisao } from "@/lib/geo";

type ClientePin = {
  id: string;
  nome: string;
  empresa: string | null;
  cidade: string | null;
  estado: string | null;
  coords: [number, number];
  precisao: Precisao;
};

const BrasilMap = dynamic(() => import("./brasil-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[72vh] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
      Carregando mapa…
    </div>
  ),
});

export function MapaWrapper({ clientes }: { clientes: ClientePin[] }) {
  return <BrasilMap clientes={clientes} />;
}
