import { HugeiconsIcon } from "@hugeicons/react";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconType;
}) {
  return (
    <div className="flex h-40 w-44 shrink-0 flex-col justify-between rounded-3xl bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <HugeiconsIcon
          icon={icon}
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-muted-foreground"
        />
      </div>
      <span className="text-[2.25rem] leading-none font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}
