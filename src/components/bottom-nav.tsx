"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon, Home01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { AddHabitDrawer } from "@/components/add/add-habit-drawer";

// Só ícones (sem labels). Início + Progresso numa pill à esquerda; o ＋ à direita
// abre o drawer de novo hábito (não navega para uma página).
const tabs = [
  { href: "/", label: "Início", icon: Home01Icon },
  { href: "/progress", label: "Progresso", icon: Analytics01Icon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md items-center justify-between px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Esquerda: pill com Início + Progresso */}
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-card p-1.5 shadow-lg ring-1 ring-white/10">
        {tabs.map(({ href, label, icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex size-12 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={icon} size={24} strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>

      {/* Direita: abre o drawer de novo hábito */}
      <AddHabitDrawer />
    </nav>
  );
}
