import {
  UserPlus,
  Wallet,
  Rocket,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Users,
  MailWarning,
  MessageCircleWarning,
  LogIn,
  LogOut,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { DashboardData } from "@/lib/data/dashboard";

export const ICONS: Record<string, LucideIcon> = {
  lead_criado: UserPlus,
  pagamento: Wallet,
  projeto: Rocket,
  lead_etapa: ArrowRightCircle,
  cliente_status: ArrowRightCircle,
  tarefa: CheckCircle2,
  cliente_criado: Users,
  lead_perdido: XCircle,
  email_falhou: MailWarning,
  whatsapp_falhou: MessageCircleWarning,
  login: LogIn,
  logout: LogOut,
  webhook_erro: AlertTriangle,
};

export const TIPOS_AVISO = new Set(["email_falhou", "whatsapp_falhou", "webhook_erro"]);

export function ActivityFeed({
  atividades,
}: {
  atividades: DashboardData["atividadesRecentes"];
}) {
  if (atividades.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {atividades.map((a) => {
        const Icon = ICONS[a.tipo] ?? ArrowRightCircle;
        const isFalha = TIPOS_AVISO.has(a.tipo);
        return (
          <li key={a.id} className="flex items-start gap-3">
            <div
              className={
                isFalha
                  ? "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning"
                  : "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-brand-100"
              }
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground">{a.descricao}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
