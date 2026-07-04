import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

export interface TimelineHabit {
  slug: string;
  nome: string;
  icon: IconType;
  hora: string; // 'HH:MM' — definida no Add; aqui só mostrada
  done: boolean;
}

// Lista de hábitos de hoje em timeline: nó (que também marca como feito) +
// linha tracejada a ligar, hora à direita, e "Agora" no próximo por fazer.
export function HabitTimeline({
  items,
  onToggle,
}: {
  items: TimelineHabit[];
  onToggle: (slug: string) => void;
}) {
  const currentIndex = items.findIndex((i) => !i.done);

  return (
    <ol className="relative">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const isCurrent = i === currentIndex;
        return (
          <li key={item.slug} className="relative flex items-start gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className="absolute top-7 bottom-0 left-[11px] border-l border-dashed border-border"
              />
            )}

            <button
              type="button"
              onClick={() => onToggle(item.slug)}
              aria-pressed={item.done}
              aria-label={
                item.done
                  ? `${item.nome}: marcar como não feito`
                  : `${item.nome}: marcar como feito`
              }
              className={cn(
                "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
                item.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-transparent hover:border-muted-foreground",
              )}
            >
              {item.done && (
                <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} />
              )}
            </button>

            <div className="flex flex-1 items-center justify-between gap-3">
              <p
                className={cn(
                  "min-w-0 truncate text-[0.95rem] font-medium",
                  item.done && "text-muted-foreground line-through",
                )}
              >
                {item.nome}
              </p>
              {isCurrent ? (
                <span className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
                  Agora
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.hora}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
