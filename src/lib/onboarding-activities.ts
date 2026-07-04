// Badges de contexto do onboarding (passo "Sobre os teus dias"). Cada item ajuda
// a perceber a rotina e a afinar que hábitos/lembretes fazem sentido para o utilizador.

export interface OnboardingActivity {
  value: string;
  label: string;
}

export const ONBOARDING_ACTIVITIES: OnboardingActivity[] = [
  { value: "acordo-cedo", label: "Acordo cedo" },
  { value: "trabalho-semana", label: "Trabalho 2ª a 6ª" },
  { value: "dia-ao-pc", label: "Passo o dia ao computador" },
  { value: "deslocacao-longa", label: "Deslocação longa" },
  { value: "bebo-pouca-agua", label: "Bebo pouca água" },
  { value: "salto-pequeno-almoco", label: "Salto o pequeno-almoço" },
  { value: "pouco-movimento", label: "Movimento-me pouco" },
  { value: "durmo-tarde", label: "Durmo tarde" },
  { value: "chego-tarde", label: "Chego tarde a casa" },
];

const LABEL_BY_VALUE = new Map(
  ONBOARDING_ACTIVITIES.map((a) => [a.value, a.label]),
);

export function activityLabel(value: string): string {
  return LABEL_BY_VALUE.get(value) ?? value;
}
