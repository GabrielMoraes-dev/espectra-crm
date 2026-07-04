"use client";

import { useState } from "react";
import Image from "next/image";
import { PesquisaForm } from "@/components/pesquisa/pesquisa-form";

export function PesquisaPageContent({
  clienteId,
  nome,
}: {
  clienteId: string;
  nome: string;
}) {
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="relative mx-auto mb-8 h-10 w-40">
          <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
        </div>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Obrigado pela avaliação!
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          Seu feedback ajuda a gente a melhorar cada projeto novo. Foi um prazer trabalhar com
          você.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="relative mx-auto mb-8 h-9 w-36">
        <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
      </div>
      <h1 className="font-heading text-center text-2xl font-semibold text-foreground">
        Seu projeto foi entregue, {nome.split(" ")[0]}!
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Sua opinião é muito importante pra gente. Leva menos de um minuto.
      </p>
      <div className="mt-10">
        <PesquisaForm clienteId={clienteId} onEnviado={() => setEnviado(true)} />
      </div>
    </div>
  );
}
