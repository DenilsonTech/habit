"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";

// Contador − N + reutilizável (etapas, minutos, …).
export function Stepper({
  value,
  onChange,
  min = 1,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuir"
        className="flex size-9 items-center justify-center rounded-full bg-secondary"
      >
        <HugeiconsIcon icon={MinusSignIcon} size={18} strokeWidth={2} />
      </button>
      <span className="text-lg font-semibold tabular-nums">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar"
        className="flex size-9 items-center justify-center rounded-full bg-secondary"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
