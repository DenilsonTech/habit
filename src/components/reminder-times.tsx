"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

// Editor de horários de lembrete reutilizável (drawer do Add + Notificações).
export function ReminderTimesEditor({
  times,
  onChange,
}: {
  times: string[];
  onChange: (times: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      {times.map((h, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5"
        >
          <HugeiconsIcon
            icon={Clock01Icon}
            size={20}
            strokeWidth={1.8}
            className="text-muted-foreground"
          />
          <input
            type="time"
            value={h}
            onChange={(e) =>
              onChange(times.map((p, idx) => (idx === i ? e.target.value : p)))
            }
            className="scheme-dark flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          {times.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(times.filter((_, idx) => idx !== i))}
              aria-label="Remover horário"
              className="text-muted-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange([...times, "13:00"])}
        className="h-11 w-full rounded-xl"
      >
        Adicionar
      </Button>
    </div>
  );
}
