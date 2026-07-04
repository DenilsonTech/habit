"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { OnboardingBackground } from "@/components/onboarding/onboarding-background";
import { IntroStep } from "@/components/onboarding/steps/intro-step";
import { DiasStep } from "@/components/onboarding/steps/dias-step";
import { ConfirmarStep } from "@/components/onboarding/steps/confirmar-step";
import { getOrCreateDeviceId, getStoredDeviceId } from "@/lib/device";
import { useAppState } from "@/lib/queries";

const TOTAL_STEPS = 3;

// Transição de slide acionada pelos botões (Continuar/Voltar) — sem gesto de dedo.
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Estado do onboarding, elevado ao pai (partilhado entre passos).
  const [idade, setIdade] = useState("");
  const [atividades, setAtividades] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  // Se este device já está onboarded, salta direto para a home.
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => setDeviceId(getStoredDeviceId()), []);
  const { data: existing } = useAppState(deviceId);
  useEffect(() => {
    if (existing?.onboarded) router.replace("/");
  }, [existing, router]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  async function handleConcluir() {
    setSubmitting(true);
    setErro(null);
    try {
      const id = getOrCreateDeviceId();
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: id, idade: Number(idade) || 23 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Não foi possível concluir. Tenta novamente.");
      }
      // Priming do cache com o estado inicial -> home instantânea (sem refetch).
      const data = await res.json().catch(() => null);
      if (data?.state) qc.setQueryData(["state", id], data.state);
      router.replace("/");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <OnboardingBackground />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {step === 0 && (
            <IntroStep
              total={TOTAL_STEPS}
              onNext={() => goTo(1)}
              onSkip={() => {
                // TODO: saltar onboarding usando valores predefinidos
              }}
            />
          )}
          {step === 1 && (
            <DiasStep
              total={TOTAL_STEPS}
              idade={idade}
              setIdade={setIdade}
              atividades={atividades}
              setAtividades={setAtividades}
              onBack={() => goTo(0)}
              onNext={() => goTo(2)}
            />
          )}
          {step === 2 && (
            <ConfirmarStep
              total={TOTAL_STEPS}
              idade={idade}
              atividades={atividades}
              onBack={() => goTo(1)}
              onConcluir={handleConcluir}
              submitting={submitting}
              erro={erro}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
