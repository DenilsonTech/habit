import { Button } from "@/components/ui/button";
import { StepDots } from "@/components/onboarding/step-dots";
import { Loader } from "@/components/loader";
import { activityLabel } from "@/lib/onboarding-activities";

// STUB do passo 3/3 — aqui vamos definir os horários dos lembretes de água.
// Desenhamos a versão final juntos a seguir; por agora só confirma o recolhido.
export function ConfirmarStep({
  total,
  idade,
  atividades,
  onBack,
  onConcluir,
  submitting,
  erro,
}: {
  total: number;
  idade: string;
  atividades: string[];
  onBack: () => void;
  onConcluir: () => void;
  submitting: boolean;
  erro?: string | null;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto px-5 pb-10 pt-16">
      <button
        type="button"
        onClick={onBack}
        className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Voltar
      </button>

      <StepDots total={total} current={2} className="mt-6" />

      <div className="mt-8">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">
          Quase lá
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
          Passo 3/3 (rascunho) — aqui vamos definir os horários dos teus lembretes
          de água. Desenhamos este ecrã a seguir.
        </p>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-4">
        <div className="space-y-4 rounded-3xl bg-card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Idade</span>
            <span className="font-medium">{idade || "—"}</span>
          </div>
          <div className="space-y-2 text-sm">
            <span className="text-muted-foreground">O que descreve os teus dias</span>
            {atividades.length === 0 ? (
              <p className="text-muted-foreground italic">Nada selecionado</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {atividades.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-secondary px-3 py-1 text-xs"
                  >
                    {activityLabel(a)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          {erro && (
            <p className="text-center text-sm text-destructive">{erro}</p>
          )}
          <Button
            className="h-14 w-full rounded-full text-base font-medium"
            onClick={onConcluir}
            disabled={submitting}
          >
            {submitting ? <Loader size={30} /> : "Concluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
