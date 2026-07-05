"use client";

import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fire02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

export interface TimelineHabit {
  slug: string;
  nome: string;
  icon: IconType;
  hora: string; // 'HH:MM' — definida no Add; aqui só mostrada
  done: boolean;
  streak: number; // dias seguidos deste hábito (🔥 quando ≥2)
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

            <motion.button
              type="button"
              onClick={() => onToggle(item.slug)}
              whileTap={{ scale: 0.85 }}
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
              <AnimatePresence>
                {item.done && (
                  <motion.span
                    key="tick"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  >
                    <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className={cn(
                    "min-w-0 truncate text-[0.95rem] font-medium",
                    item.done && "text-muted-foreground line-through",
                  )}
                >
                  {item.nome}
                </p>
                {item.streak >= 2 && (
                  <span className="flex shrink-0 items-center gap-0.5 text-primary">
                    <HugeiconsIcon icon={Fire02Icon} size={13} strokeWidth={2} />
                    <span className="text-xs font-semibold tabular-nums">
                      {item.streak}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isCurrent && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary-foreground uppercase">
                    Agora
                  </span>
                )}
                {item.hora && (
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isCurrent
                        ? "font-semibold text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.hora}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
