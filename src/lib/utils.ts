import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatTelefone(value: string) {
  const digitos = value.replace(/\D/g, "").slice(0, 11)
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : ""
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatDateLong(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d)
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(d)
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function parseResponsabilidades(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getPrazoUrgencia(date: Date | string | null | undefined) {
  if (!date) return null
  const prazo = typeof date === "string" ? new Date(date) : new Date(date)
  prazo.setHours(0, 0, 0, 0)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diffDias = Math.round((prazo.getTime() - hoje.getTime()) / 86_400_000)

  if (diffDias > 2) return null
  if (diffDias === 2) {
    return { nivel: "verde" as const, label: "2 dias para o prazo", className: "bg-success/20 text-success" }
  }
  if (diffDias === 1) {
    return { nivel: "amarelo" as const, label: "1 dia para o prazo", className: "bg-warning/20 text-warning" }
  }
  if (diffDias === 0) {
    return { nivel: "vermelho" as const, label: "Entrega hoje", className: "bg-danger/20 text-danger" }
  }
  return { nivel: "vermelho" as const, label: "Prazo atrasado", className: "bg-danger/20 text-danger" }
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `há ${months}m`
  return `há ${Math.floor(months / 12)}a`
}
