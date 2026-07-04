"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { FloatingField } from "@/components/floating-field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Stepper } from "@/components/add/stepper";
import { IconPicker } from "@/components/add/icon-picker";
import { habitIcon } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

const SIZES = ["S", "M", "L", "XL"];

const TYPES = [
  { value: "simples", label: "Simples", info: "Apenas feito ou não" },
  { value: "multi", label: "Multi-etapas", info: "Múltiplas etapas num hábito" },
  { value: "timer", label: "Temporizador", info: "Com uma duração definida" },
];

export function DetalhesStep({
  nome,
  onNome,
  descricao,
  onDescricao,
  icon,
  onIcon,
  tamanho,
  onTamanho,
  tipo,
  onTipo,
  etapas,
  onEtapas,
  minutos,
  onMinutos,
}: {
  nome: string;
  onNome: (value: string) => void;
  descricao: string;
  onDescricao: (value: string) => void;
  icon: string;
  onIcon: (value: string) => void;
  tamanho: string;
  onTamanho: (value: string) => void;
  tipo: string;
  onTipo: (value: string) => void;
  etapas: number;
  onEtapas: (value: number) => void;
  minutos: number;
  onMinutos: (value: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Preview + escolha de ícone */}
      <div className="flex justify-center pt-1">
        <div className="flex size-40 flex-col rounded-3xl bg-card p-4">
          <span className="text-sm font-medium">{nome || "Novo hábito"}</span>
          <div className="mt-auto flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-label="Escolher ícone"
              className={cn(
                "flex size-12 items-center justify-center rounded-full transition-colors",
                icon
                  ? "bg-primary/15 text-primary"
                  : "border border-border text-muted-foreground",
              )}
            >
              <HugeiconsIcon
                icon={icon ? habitIcon(icon) : PlusSignIcon}
                size={20}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <IconPicker
          value={icon}
          onSelect={(key) => {
            onIcon(key);
            setPickerOpen(false);
          }}
        />
      )}

      <FloatingField id="nome" label="Nome do hábito" value={nome} onChange={onNome} />
      <FloatingField
        id="descricao"
        label="Descrição"
        value={descricao}
        onChange={onDescricao}
      />

      {/* Tamanho do mosaico */}
      <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">Tamanho do mosaico</span>
        <ToggleGroup
          type="single"
          value={tamanho}
          onValueChange={(v) => v && onTamanho(v)}
          className="gap-1"
        >
          {SIZES.map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              className="size-9 rounded-full bg-secondary text-xs font-semibold text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Tipo */}
      <div className="space-y-3 rounded-2xl bg-card p-4">
        <span className="text-sm text-muted-foreground">Tipo</span>
        <ToggleGroup
          type="single"
          value={tipo}
          onValueChange={(v) => v && onTipo(v)}
          className="flex w-full gap-2"
        >
          {TYPES.map((t) => (
            <ToggleGroupItem
              key={t.value}
              value={t.value}
              className="h-10 flex-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          {TYPES.find((t) => t.value === tipo)?.info}
        </p>
        {tipo === "multi" && <Stepper value={etapas} onChange={onEtapas} min={2} />}
        {tipo === "timer" && (
          <Stepper value={minutos} onChange={onMinutos} min={1} unit="min" />
        )}
      </div>
    </div>
  );
}
