"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth-actions";

const LIGHT_SCOPE_STYLE = {
  "--card": "#ffffff",
  "--card-foreground": "var(--brand-900)",
  "--foreground": "var(--brand-900)",
  "--muted-foreground": "#64748b",
  "--border": "#e2e8f0",
  "--input": "#e2e8f0",
  "--ring": "var(--brand-500)",
} as React.CSSProperties;

function WelcomeToast() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <div className="relative h-6 w-24 shrink-0">
        <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain object-left" />
      </div>
      <p className="text-sm font-medium text-foreground">Bem-vindo de volta, chefe! 👋</p>
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await login({ email, password });
        toast.custom(() => <WelcomeToast />);
        router.push("/");
        router.refresh();
      } catch {
        toast.error("Email ou senha inválidos");
      }
    });
  }

  return (
    <div className="w-full max-w-sm" style={LIGHT_SCOPE_STYLE}>
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse o CRM interno da Espectra.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
