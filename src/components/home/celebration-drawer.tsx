"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Fire02Icon } from "@hugeicons/core-free-icons";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Celebração ao completar todos os hábitos do dia (drawer verde, com pontos/streak).
export function CelebrationDrawer({
  open,
  onOpenChange,
  pontos,
  streak,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pontos: number;
  streak: number;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none bg-primary text-primary-foreground">
        <DrawerDescription className="sr-only">
          Todos os hábitos completados
        </DrawerDescription>
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: GRAIN }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-6 pb-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary-foreground/15">
              <HugeiconsIcon icon={Fire02Icon} size={40} strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <DrawerTitle className="text-3xl font-bold text-primary-foreground">
                Conseguiu!
              </DrawerTitle>
              <p className="text-sm text-primary-foreground/85">
                Todos os hábitos de hoje completados
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="tabular-nums">{pontos} pontos</span>
              <span className="opacity-40">·</span>
              <span className="tabular-nums">{streak} dias de streak</span>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-2 h-14 w-full rounded-full bg-primary-foreground text-base font-semibold text-primary hover:bg-primary-foreground/90"
            >
              Fantástico!
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
