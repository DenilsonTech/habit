"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { HABIT_ICONS } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

// Picker de ícone do hábito, em Hugeicons (conjunto curado). Grid; o selecionado
// fica verde.
export function IconPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (key: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const items = query
    ? HABIT_ICONS.filter((i) => i.key.includes(query))
    : HABIT_ICONS;

  return (
    <div className="space-y-3 rounded-2xl bg-card p-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Procurar ícone"
        className="h-10 w-full rounded-xl bg-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="scrollbar-none grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto">
        {items.map(({ key, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-label={key}
            aria-pressed={value === key}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl transition-colors",
              value === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground active:bg-secondary/60",
            )}
          >
            <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </div>
  );
}
