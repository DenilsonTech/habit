"use client";

import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "180", label: "180 dias" },
  { value: "365", label: "365 dias" },
];

export function PeriodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          aria-pressed={value === p.value}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === p.value
              ? "bg-secondary text-foreground"
              : "text-muted-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
