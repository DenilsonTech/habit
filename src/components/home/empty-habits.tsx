"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Target01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AddHabitDrawer } from "@/components/add/add-habit-drawer";

// Mostrado na home quando ainda não há hábitos criados (só a água default).
export function EmptyHabits() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <HugeiconsIcon icon={Target01Icon} size={28} strokeWidth={1.8} />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold">Ainda não tens hábitos</p>
        <p className="text-sm text-muted-foreground">
          Cria o teu primeiro hábito e começa a construir a tua rotina.
        </p>
      </div>
      <AddHabitDrawer
        trigger={
          <Button className="h-11 rounded-full px-6 font-semibold">
            Criar hábito
          </Button>
        }
      />
    </div>
  );
}
