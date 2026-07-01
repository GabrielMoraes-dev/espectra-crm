import {
  Phone,
  AtSign,
  Mail,
  Globe,
  Tag,
  Wallet,
  UserSquare2,
  CalendarClock,
  FileText,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, getPrazoUrgencia } from "@/lib/utils";
import type { Cliente, MembroEquipe } from "@/generated/prisma/client";

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  badge?: { label: string; className: string } | null;
}) {
  const content = (
    <p className="truncate text-sm font-medium text-foreground">{value}</p>
  );

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-foreground underline-offset-2 hover:text-brand-100 hover:underline"
            >
              {value}
            </a>
          ) : (
            content
          )}
          {badge && <StatusBadge label={badge.label} className={badge.className} />}
        </div>
      </div>
    </div>
  );
}

export function ClienteInfoGrid({
  cliente,
}: {
  cliente: Cliente & { responsavel: MembroEquipe | null };
}) {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <InfoItem icon={Phone} label="WhatsApp" value={cliente.whatsapp ?? "—"} />
        <InfoItem icon={AtSign} label="Instagram" value={cliente.instagram ?? "—"} />
        <InfoItem icon={Mail} label="Email" value={cliente.email ?? "—"} />
        <InfoItem
          icon={Globe}
          label="Site pronto"
          value={cliente.site ?? "—"}
          href={cliente.site ?? undefined}
        />
        <InfoItem
          icon={MapPin}
          label="Localização"
          value={[cliente.cidade, cliente.estado].filter(Boolean).join(", ") || "—"}
        />
        <InfoItem icon={Tag} label="Nicho" value={cliente.nicho ?? "—"} />
        <InfoItem
          icon={Wallet}
          label="Valor contratado"
          value={`${formatCurrency(cliente.valor)}${cliente.planoContratado ? ` · ${cliente.planoContratado}` : ""}`}
        />
        <InfoItem icon={UserSquare2} label="Responsável" value={cliente.responsavel?.nome ?? "—"} />
        <InfoItem
          icon={CalendarClock}
          label="Prazo"
          value={formatDate(cliente.prazo)}
          badge={getPrazoUrgencia(cliente.prazo)}
        />
        <InfoItem
          icon={FileText}
          label="Contrato"
          value={cliente.contratoUrl ? "Ver contrato" : "Nenhum contrato anexado"}
          href={cliente.contratoUrl ?? undefined}
        />
      </CardContent>
    </Card>
  );
}
