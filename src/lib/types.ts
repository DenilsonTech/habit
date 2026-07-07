// Tipos partilhados da app. Ver PRD secções 5 e 6.

/** Tipo de hábito na UI: feito/não feito vs contador acumulado. */
export type HabitKind = "boolean" | "counter";

/** Slugs dos 5 hábitos pré-definidos (PRD 6.1). */
export type PredefinedHabitSlug =
  | "agua"
  | "sono"
  | "movimento"
  | "pequeno-almoco"
  | "pausa-olhos";
