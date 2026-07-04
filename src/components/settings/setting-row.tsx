import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

// Linha de definição: ícone + label + valor/trailing (chevron por defeito se
// for clicável). `danger` para ações destrutivas.
export function SettingRow({
  icon,
  label,
  value,
  trailing,
  onClick,
  danger,
}: {
  icon?: IconType;
  label: string;
  value?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      {icon && (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            danger
              ? "bg-destructive/15 text-destructive"
              : "bg-secondary text-foreground",
          )}
        >
          <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
        </span>
      )}
      <span
        className={cn(
          "flex-1 text-[0.95rem] font-medium",
          danger && "text-destructive",
        )}
      >
        {label}
      </span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {trailing ??
        (onClick && !danger ? (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            strokeWidth={2}
            className="text-muted-foreground/50"
          />
        ) : null)}
    </>
  );

  const className = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left",
    onClick && "transition-colors active:bg-secondary/50",
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}
