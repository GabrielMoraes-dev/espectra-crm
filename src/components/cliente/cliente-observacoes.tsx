"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateClienteObservacoes } from "@/lib/actions/cliente-actions";

export function ClienteObservacoes({
  clienteId,
  observacoes,
}: {
  clienteId: string;
  observacoes: string | null;
}) {
  const [value, setValue] = useState(observacoes ?? "");
  const [initial, setInitial] = useState(observacoes ?? "");
  const [pending, startTransition] = useTransition();

  function handleBlur() {
    if (value === initial) return;
    startTransition(async () => {
      await updateClienteObservacoes(clienteId, value);
      setInitial(value);
      toast.success("Observações salvas");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Observações</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={5}
          placeholder="Ex: O cliente solicitou alterar a cor do botão principal e adicionar mais um depoimento antes da publicação."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          disabled={pending}
        />
      </CardContent>
    </Card>
  );
}
