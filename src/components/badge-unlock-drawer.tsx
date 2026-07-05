"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { badgeByChave } from "@/lib/badges";

// Celebra uma ou mais conquistas acabadas de desbloquear (drawer verde, ícone
// com zoom via spring). `chaves` vazio => fechado.
export function BadgeUnlockDrawer({
  chaves,
  onClose,
}: {
  chaves: string[];
  onClose: () => void;
}) {
  const badges = chaves
    .map(badgeByChave)
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const open = badges.length > 0;
  const multi = badges.length > 1;

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DrawerContent className="border-none bg-primary text-primary-foreground">
        <DrawerDescription className="sr-only">
          Nova conquista desbloqueada
        </DrawerDescription>
        <div className="flex flex-col items-center gap-4 px-6 pt-6 pb-8 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary-foreground/85 uppercase">
            {multi ? "Novas conquistas!" : "Conquista desbloqueada!"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {badges.map((b, i) => (
              <motion.div
                key={b.chave}
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: i * 0.1,
                }}
                className="flex size-20 items-center justify-center rounded-full bg-primary-foreground/15"
              >
                <HugeiconsIcon icon={b.icon} size={40} strokeWidth={1.8} />
              </motion.div>
            ))}
          </div>

          <div className="space-y-1">
            <DrawerTitle className="text-2xl font-bold text-primary-foreground">
              {multi ? `${badges.length} conquistas` : badges[0]?.nome}
            </DrawerTitle>
            <p className="text-sm text-primary-foreground/85">
              {multi
                ? badges.map((b) => b.nome).join(" · ")
                : badges[0]?.descricao}
            </p>
          </div>

          <Button
            onClick={onClose}
            className="mt-2 h-14 w-full rounded-full bg-primary-foreground text-base font-semibold text-primary hover:bg-primary-foreground/90"
          >
            Fantástico!
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
