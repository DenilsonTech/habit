"use client";

import { cn } from "@/lib/utils";

// Campo preenchido, sem stroke, com a label dentro (flutua para o topo quando
// há foco ou valor). Pensado para mobile — nada depende de hover.
export function FloatingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative rounded-2xl bg-card", className)}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer h-16 w-full rounded-2xl bg-transparent px-4 pt-7 pb-2 text-base text-foreground outline-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground transition-all duration-150 peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
