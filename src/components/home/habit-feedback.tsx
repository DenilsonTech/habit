"use client";

import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fire02Icon } from "@hugeicons/core-free-icons";

export interface Feedback {
  key: number; // muda a cada conclusão para reiniciar a animação
  pontos: number;
  streak: number;
  message: string;
}

// Chip flutuante de reforço a cada conclusão (sobe e desvanece). Self-contained
// (Framer + Hugeicons) — sem dependências novas nem pedidos externos (CSP).
export function HabitFeedback({ feedback }: { feedback: Feedback | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.key}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
          >
            <span className="tabular-nums">+{feedback.pontos}</span>
            {feedback.streak >= 2 && (
              <span className="flex items-center gap-1 border-l border-primary-foreground/25 pl-2">
                <HugeiconsIcon icon={Fire02Icon} size={15} strokeWidth={2} />
                <span className="tabular-nums">{feedback.streak}</span>
              </span>
            )}
            <span className="border-l border-primary-foreground/25 pl-2 font-medium opacity-95">
              {feedback.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
