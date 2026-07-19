"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { alterarSenha } from "@/lib/actions/auth-actions";

export function TrocarSenhaForm() {
  const [aberto, setAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [pending, startTransition] = useTransition();

  function limpar() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error("A confirmação não bate com a nova senha");
      return;
    }
    startTransition(async () => {
      try {
        await alterarSenha({ senhaAtual, novaSenha });
        toast.success("Senha alterada com sucesso");
        limpar();
        setAberto(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível trocar a senha");
      }
    });
  }

  if (!aberto) {
    return (
      <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
        <KeyRound className="size-3.5" />
        Trocar senha
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-3">
      <div className="space-y-1.5">
        <Label htmlFor="senhaAtual">Senha atual</Label>
        <Input
          id="senhaAtual"
          type="password"
          required
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="novaSenha">Nova senha</Label>
        <Input
          id="novaSenha"
          type="password"
          required
          minLength={8}
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
        <Input
          id="confirmarSenha"
          type="password"
          required
          minLength={8}
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando..." : "Salvar nova senha"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            limpar();
            setAberto(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
