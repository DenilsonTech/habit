"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dumbbell01Icon,
  HealtcareIcon,
  Leaf01Icon,
  PlusSignIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "saude", label: "Saúde", icon: HealtcareIcon },
  { value: "foco", label: "Foco", icon: Target01Icon },
  { value: "calma", label: "Calma", icon: Leaf01Icon },
  { value: "corpo", label: "Corpo", icon: Dumbbell01Icon },
];

const SUGGESTIONS: Record<string, string[]> = {
  saude: [
    "Beber água de manhã",
    "Caminhar 20 minutos",
    "Dormir antes das 23h",
    "Comer fruta",
  ],
  foco: [
    "Preparar coisas para amanhã",
    "Ler 10 páginas",
    "1h sem telemóvel",
    "Planear o dia",
  ],
  calma: [
    "Respirar 5 minutos",
    "Alongar ao acordar",
    "Escrever 3 gratidões",
    "Meditar",
  ],
  corpo: ["Fazer a cama", "Alongamentos", "Subir escadas", "Postura direita"],
};

export function EscolherStep({
  category,
  onCategory,
  onEscolher,
}: {
  category: string;
  onCategory: (value: string) => void;
  onEscolher: (nome: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Categorias — scroll horizontal, cards arredondados */}
      <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onCategory(c.value)}
            className={cn(
              "flex h-32 w-28 shrink-0 flex-col items-center justify-center gap-3 rounded-[1.75rem] transition-colors",
              category === c.value
                ? "bg-primary/15 text-primary"
                : "bg-card text-foreground",
            )}
          >
            <HugeiconsIcon icon={c.icon} size={28} strokeWidth={1.5} />
            <span className="text-sm font-medium">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Sugestões — cards arredondados, toda a linha clicável */}
      <div className="space-y-3">
        {SUGGESTIONS[category].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onEscolher(s)}
            className="flex w-full items-center justify-between rounded-[1.75rem] bg-card px-5 py-6 text-left transition-colors active:bg-secondary"
          >
            <span className="text-[0.95rem] font-medium">{s}</span>
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={22}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
