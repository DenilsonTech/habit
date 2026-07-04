"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ReminderTimesEditor } from "@/components/reminder-times";

const DAYS = [
  { value: "seg", label: "Se" },
  { value: "ter", label: "Te" },
  { value: "qua", label: "Qa" },
  { value: "qui", label: "Qi" },
  { value: "sex", label: "Sx" },
  { value: "sab", label: "Sá" },
  { value: "dom", label: "Do" },
];

export function HorarioStep({
  dias,
  onDias,
  lembrete,
  onLembrete,
  horarios,
  onHorarios,
}: {
  dias: string[];
  onDias: (value: string[]) => void;
  lembrete: boolean;
  onLembrete: (value: boolean) => void;
  horarios: string[];
  onHorarios: (value: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Com que frequência vais fazer isto? Adiciona lembretes para manter a
        consistência.
      </p>

      <div className="space-y-3">
        <span className="block text-center text-sm text-muted-foreground">
          Dias
        </span>
        <ToggleGroup
          type="multiple"
          value={dias}
          onValueChange={onDias}
          className="flex w-full justify-between rounded-2xl bg-card p-2"
        >
          {DAYS.map((d) => (
            <ToggleGroupItem
              key={d.value}
              value={d.value}
              className="size-10 rounded-full bg-secondary text-xs font-medium text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {d.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-3">
        <span className="block text-center text-sm text-muted-foreground">
          Horários
        </span>
        <div className="space-y-3 rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between">
            <Label>Lembrete</Label>
            <Switch checked={lembrete} onCheckedChange={onLembrete} />
          </div>
          {lembrete && (
            <ReminderTimesEditor times={horarios} onChange={onHorarios} />
          )}
        </div>
      </div>
    </div>
  );
}
