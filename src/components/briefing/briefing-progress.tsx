import { Progress } from "@/components/ui/progress";

export function BriefingProgress({
  answered,
  total,
  step,
  totalSteps,
}: {
  answered: number;
  total: number;
  step: number;
  totalSteps: number;
}) {
  const pct = Math.min(100, Math.round((answered / total) * 100));

  return (
    <div className="mt-10">
      <Progress value={pct} />
      <div className="mt-2 flex justify-between text-[11.5px] tracking-wide text-muted-foreground uppercase">
        <span>
          {answered} de {total} respondidas
        </span>
        <span>
          Etapa {step} de {totalSteps}
        </span>
      </div>
    </div>
  );
}
