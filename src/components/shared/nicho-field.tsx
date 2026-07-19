"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NICHOS_CLIENTE } from "@/lib/constants";

const NICHOS_FIXOS = NICHOS_CLIENTE.slice(0, -1);

export function NichoField({
  value,
  onChange,
  label = "Nicho",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  // Nicho já era texto livre antes — se o valor atual não bater com nenhuma opção
  // fixa (dado antigo, ou algo fora da lista), mantém o campo de texto visível em
  // vez de esconder o que já estava cadastrado.
  const [modoLivre, setModoLivre] = useState(() => !!value && !NICHOS_FIXOS.includes(value));

  return (
    <div className="space-y-1.5">
      <Label htmlFor="nicho-select">{label}</Label>
      <Select
        value={modoLivre ? "Outro" : value}
        onValueChange={(v) => {
          if (v === "Outro") {
            setModoLivre(true);
            onChange("");
          } else {
            setModoLivre(false);
            onChange(v ?? "");
          }
        }}
      >
        <SelectTrigger id="nicho-select" className="w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {NICHOS_CLIENTE.map((n) => (
            <SelectItem key={n} value={n}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {modoLivre && (
        <Input
          id="nicho-input"
          placeholder="Digite o nicho"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}
