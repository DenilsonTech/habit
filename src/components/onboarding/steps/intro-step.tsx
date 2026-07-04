import { Button } from "@/components/ui/button";
import { StepDots } from "@/components/onboarding/step-dots";
import Image from "next/image";

export function IntroStep({
  total,
  onNext,
  onSkip,
}: {
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col justify-end overflow-y-auto px-5 pb-10 pt-16">
      {/* Wordmark */}
      <div className="mb-6 flex items-center gap-2">
        <Image src="/delela-logo.svg" alt="Hábitos" width={24} height={24} />
        <span className="text-base font-semibold tracking-tight">Hábitos</span>
      </div>

      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.02em]">
        Cuida de ti,
        <br />
        <span className="text-primary">todos os dias.</span>
      </h1>

      <p className="mt-4 max-w-[20rem] text-[0.95rem] leading-relaxed text-muted-foreground">
        Cinco hábitos simples, a começar pela hidratação. Constrói consistência ao
        teu ritmo, sem complicações.
      </p>

      <StepDots total={total} current={0} className="mt-8" />

      <div className="mt-8 space-y-2">
        <Button
          className="h-14 w-full rounded-full text-base font-medium"
          onClick={onNext}
        >
          Começar
        </Button>
        <Button
          variant="ghost"
          className="h-12 w-full rounded-full text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          Saltar por agora
        </Button>
      </div>
    </div>
  );
}
