"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NICHOS_CLIENTE } from "@/lib/constants";

function isCustomValue(value: string) {
  return value !== "" && !NICHOS_CLIENTE.includes(value);
}

export function NichoField({
  value,
  onChange,
  label = "Nicho",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [selected, setSelected] = useState(() => (isCustomValue(value) ? "Outro" : value));
  const [customValue, setCustomValue] = useState(() => (isCustomValue(value) ? value : ""));

  useEffect(() => {
    const custom = isCustomValue(value);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncs local selection when the form is reset from outside (e.g. dialog reopened with another record)
    setSelected(custom ? "Outro" : value);
    setCustomValue(custom ? value : "");
  }, [value]);

  function handleSelect(novoValor: string) {
    setSelected(novoValor);
    onChange(novoValor === "Outro" ? customValue : novoValor);
  }

  function handleCustomChange(texto: string) {
    setCustomValue(texto);
    onChange(texto);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={selected} onValueChange={(v) => handleSelect(v ?? "")}>
        <SelectTrigger className="w-full">
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

      <AnimatePresence initial={false}>
        {selected === "Outro" && (
          <motion.div
            key="nicho-outro"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="nicho-outro-input">Qual é o nicho do cliente?</Label>
              <Input
                id="nicho-outro-input"
                required
                placeholder="Ex.: Arquiteto, Engenheiro, Corretor de Seguros..."
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
