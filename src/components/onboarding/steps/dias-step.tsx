import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StepDots } from "@/components/onboarding/step-dots";
import { ONBOARDING_ACTIVITIES } from "@/lib/onboarding-activities";

export function DiasStep({
  total,
  idade,
  setIdade,
  atividades,
  setAtividades,
  onBack,
  onNext,
}: {
  total: number;
  idade: string;
  setIdade: (value: string) => void;
  atividades: string[];
  setAtividades: (value: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const podeContinuar = idade.trim() !== "";

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto px-5 pb-10 pt-16">
      <button
        type="button"
        onClick={onBack}
        className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Voltar
      </button>

      <StepDots total={total} current={1} className="mt-6" />

      <div className="mt-8">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">
          Sobre os teus dias
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
          Ajuda-me a perceber o teu ritmo. Diz-me a tua idade e escolhe o que se
          aplica a ti.
        </p>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-7">
        <div className="space-y-2">
          <Label htmlFor="idade">Idade</Label>
          <Input
            id="idade"
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="23"
            value={idade}
            onChange={(e) => setIdade(e.target.value.replace(/\D/g, ""))}
            className="h-12 w-full"
          />
        </div>

        <div className="space-y-3">
          <Label>O que descreve os teus dias?</Label>
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={atividades}
            onValueChange={setAtividades}
            className="flex w-full flex-row flex-wrap justify-start gap-2"
          >
            {ONBOARDING_ACTIVITIES.map((a) => (
              <ToggleGroupItem
                key={a.value}
                value={a.value}
                className="h-10 rounded-full border-border px-4 text-sm font-medium data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {a.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-auto pt-4">
          <Button
            className="h-14 w-full rounded-full text-base font-medium"
            disabled={!podeContinuar}
            onClick={onNext}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
