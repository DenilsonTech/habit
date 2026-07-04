import { cn } from "@/lib/utils";

// Indicador de passos do onboarding. `current` é 0-indexado.
export function StepDots({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Passo ${current + 1} de ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-primary" : "w-1.5 bg-white/25",
          )}
        />
      ))}
    </div>
  );
}
