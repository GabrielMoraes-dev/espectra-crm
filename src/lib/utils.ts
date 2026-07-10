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

export function formatCpfCnpj(value: string) {
  const digitos = value.replace(/\D/g, "").slice(0, 14)
  if (digitos.length <= 11) {
    if (digitos.length <= 3) return digitos
    if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`
    if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
  }
  if (digitos.length <= 5) return `${digitos.slice(0, 2)}.${digitos.slice(2)}`
  if (digitos.length <= 8) return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`
  if (digitos.length <= 12) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`
  }
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`
}

const FUSO_BRASIL = "America/Sao_Paulo"

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO_BRASIL,
  }).format(d)
}

export function formatDateLong(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: FUSO_BRASIL,
  }).format(d)
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: FUSO_BRASIL,
  }).format(d)
}

// Para campos "só data" (ex: prazo), salvos como meia-noite UTC a partir de um
// input tipo "YYYY-MM-DD" — usa o fuso UTC pra ler de volta o mesmo dia que foi
// digitado, em vez do fuso do Brasil (que jogaria a exibição um dia pra trás).
export function formatDataPrazo(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
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

export function isImagemUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|avif|heic|svg)(\?.*)?$/i.test(url)
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

function dataEmDiasBrasil(date: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_BRASIL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const obter = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value)
  return Date.UTC(obter("year"), obter("month") - 1, obter("day"))
}

export function getPrazoUrgencia(date: Date | string | null | undefined) {
  if (!date) return null
  const prazo = typeof date === "string" ? new Date(date) : date
  const prazoDias = Date.UTC(prazo.getUTCFullYear(), prazo.getUTCMonth(), prazo.getUTCDate())
  const hojeDias = dataEmDiasBrasil(new Date())
  const diffDias = Math.round((prazoDias - hojeDias) / 86_400_000)

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
