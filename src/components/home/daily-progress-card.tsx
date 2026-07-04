import { HugeiconsIcon } from "@hugeicons/react";
import {
  Fire02Icon,
  GlassWaterIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// Card de progresso diário (verde, cor primária). Representa o dia (pontuação de
// hoje + média dos últimos 30 dias) e integra a água — hábito primário — como
// copos que enchem ao tocar. Reseta a cada dia (registo por data).
export function DailyProgressCard({
  todayPct,
  last30Pct,
  streak,
  cups,
  cupsGoal,
  onSetCups,
}: {
  todayPct: number;
  last30Pct: number;
  streak: number;
  cups: number;
  cupsGoal: number;
  onSetCups: (value: number) => void;
}) {
  return (
    <section className="space-y-4 rounded-3xl bg-primary p-5 text-primary-foreground">
      {/* Cabeçalho: título + streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground/85">
          <HugeiconsIcon icon={Target01Icon} size={16} strokeWidth={1.8} />
          <span className="text-xs font-semibold tracking-wide uppercase">
            Progresso de hoje
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <HugeiconsIcon icon={Fire02Icon} size={16} strokeWidth={1.8} />
          <span className="tabular-nums">{streak}</span>
        </div>
      </div>

      {/* Barra de progresso do dia */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/25">
        <div
          className="h-full rounded-full bg-primary-foreground transition-all"
          style={{ width: `${todayPct}%` }}
        />
      </div>

      {/* Métricas */}
      <div className="flex gap-8">
        <div>
          <p className="text-[0.7rem] font-medium tracking-wide text-primary-foreground/75 uppercase">
            Pontuação de hoje
          </p>
          <p className="mt-1 text-[2rem] leading-none font-bold tabular-nums">
            {todayPct}%
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] font-medium tracking-wide text-primary-foreground/75 uppercase">
            Últimos 30 dias
          </p>
          <p className="mt-1 text-[2rem] leading-none font-bold text-primary-foreground/85 tabular-nums">
            {last30Pct}%
          </p>
        </div>
      </div>

      {/* Água — copos que enchem ao tocar, numa só fila */}
      <div className="space-y-3 rounded-2xl bg-primary-foreground/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Água</span>
          <span className="text-xs text-primary-foreground/75 tabular-nums">
            {cups} / {cupsGoal} copos
          </span>
        </div>
        <div className="flex items-center justify-between">
          {Array.from({ length: cupsGoal }).map((_, i) => {
            const cheio = i < cups;
            return (
              <button
                key={i}
                type="button"
                // tocar enche até este copo; tocar no último cheio remove-o
                onClick={() => onSetCups(cups === i + 1 ? i : i + 1)}
                aria-label={`Copo ${i + 1}${cheio ? " (cheio)" : ""}`}
                aria-pressed={cheio}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-colors",
                  cheio
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary-foreground/15 text-primary-foreground/50",
                )}
              >
                <HugeiconsIcon icon={GlassWaterIcon} size={16} strokeWidth={1.8} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
