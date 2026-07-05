"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredDeviceId } from "@/lib/device";
import { habitIcon } from "@/lib/habit-icons";
import { useAppState, useLogHabit } from "@/lib/queries";
import { HomeHeader } from "@/components/home/home-header";
import { DailyProgressCard } from "@/components/home/daily-progress-card";
import { HabitTimeline } from "@/components/home/habit-timeline";
import { EmptyHabits } from "@/components/home/empty-habits";
import { HabitFeedback, type Feedback } from "@/components/home/habit-feedback";
import { CelebrationDrawer } from "@/components/home/celebration-drawer";

// Mensagem de reforço conforme o progresso do dia (sem emojis, on-brand).
function encouragement(done: number, total: number): string {
  if (done <= 1) return "Começaste bem.";
  const ratio = done / total;
  if (ratio >= 0.66) return "Falta pouco!";
  if (ratio >= 0.4) return "Já vais a meio.";
  return "Boa, mais um.";
}

function HomeSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-11 animate-pulse rounded-full bg-card" />
      <div className="h-64 animate-pulse rounded-3xl bg-card" />
      <div className="h-40 animate-pulse rounded-3xl bg-card" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceChecked, setDeviceChecked] = useState(false);

  useEffect(() => {
    setDeviceId(getStoredDeviceId());
    setDeviceChecked(true);
  }, []);

  const { data: state, isLoading } = useAppState(deviceId);
  const logHabit = useLogHabit(deviceId ?? "");

  // Sem device, ou device sem onboarding -> para o onboarding.
  useEffect(() => {
    if (deviceChecked && !deviceId) router.replace("/onboarding");
  }, [deviceChecked, deviceId, router]);
  useEffect(() => {
    if (state && !state.onboarded) router.replace("/onboarding");
  }, [state, router]);

  // Celebração ao completar todos os hábitos do dia (só na transição).
  const [showCelebration, setShowCelebration] = useState(false);
  const wasAllDone = useRef(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (!state?.onboarded) return;
    const total = state.habits.length;
    const done = state.habits.filter((h) => state.logs[h.id]?.concluido).length;
    const allDone = total > 0 && done === total;
    if (!initialized.current) {
      initialized.current = true;
      wasAllDone.current = allDone;
      return;
    }
    if (allDone && !wasAllDone.current) setShowCelebration(true);
    wasAllDone.current = allDone;
  }, [state]);

  // Chip de reforço a cada conclusão (auto-desaparece).
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 1800);
    return () => clearTimeout(t);
  }, [feedback]);

  if (!deviceId || isLoading || !state || !state.onboarded) {
    return <HomeSkeleton />;
  }

  const agua = state.habits.find((h) => h.slug === "agua");
  const timeline = state.habits.filter((h) => h.slug !== "agua");
  const cupMl = state.water?.cupMl ?? 250;
  const goalMl = state.water?.goalMl ?? 2000;
  const cupsGoal = Math.round(goalMl / cupMl);
  const cups = Math.round((state.water?.currentMl ?? 0) / cupMl);

  const total = state.habits.length;
  const doneCount = state.habits.filter((h) => state.logs[h.id]?.concluido).length;
  // Progresso do dia = média das frações de conclusão. Contadores (água) contam
  // proporção valor/meta, por isso cada copo já empurra a % (não salta só no fim).
  const progressSum = state.habits.reduce((sum, h) => {
    const log = state.logs[h.id];
    if (h.isCounter && h.metaValor) {
      return sum + Math.min((log?.valor ?? 0) / h.metaValor, 1);
    }
    return sum + (log?.concluido ? 1 : 0);
  }, 0);
  const todayPct = total ? Math.round((progressSum / total) * 100) : 0;
  // Contagem da secção "Hábitos de hoje" = só a timeline (exclui a água, que
  // aparece nos copos, não na lista).
  const timelineDone = timeline.filter((h) => state.logs[h.id]?.concluido).length;
  // Streak do topo = dias seguidos ativos (global), não o máximo por hábito.
  const streak = state.diaStreak;

  return (
    <div className="space-y-5">
      <HabitFeedback feedback={feedback} />
      <HomeHeader />

      <DailyProgressCard
        todayPct={todayPct}
        last30Pct={0}
        streak={streak}
        cups={cups}
        cupsGoal={cupsGoal}
        onSetCups={(n) => {
          if (!agua) return;
          const wasDone = state.logs[agua.id]?.concluido ?? false;
          logHabit.mutate(
            { habitId: agua.id, valor: n * cupMl },
            {
              onSuccess: (data) => {
                // Só festeja a meta de água atingida (o incremento por copo já
                // se vê na barra); se completar o dia, deixa a celebração.
                if (data.concluido && !wasDone && doneCount + 1 < total) {
                  setFeedback({
                    key: Date.now(),
                    pontos: agua.pontos,
                    streak: data.streak.atual,
                    message: "Meta de água atingida!",
                  });
                }
              },
            },
          );
        }}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.95rem] font-semibold">Hábitos de hoje</h2>
          {timeline.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {timelineDone} de {timeline.length}
            </span>
          )}
        </div>
        {timeline.length > 0 ? (
          <HabitTimeline
            items={timeline.map((h) => ({
              slug: h.slug,
              nome: h.nome,
              icon: habitIcon(h.icon),
              hora: h.horas[0] ?? "",
              done: state.logs[h.id]?.concluido ?? false,
              streak: state.streaks[h.id]?.atual ?? 0,
            }))}
            onToggle={(slug) => {
              const h = timeline.find((x) => x.slug === slug);
              if (!h) return;
              const wasDone = state.logs[h.id]?.concluido ?? false;
              logHabit.mutate(
                { habitId: h.id, concluido: !wasDone },
                {
                  onSuccess: (data) => {
                    // Reforço só ao concluir (não ao desmarcar); se completar o
                    // dia inteiro, deixa a celebração brilhar sozinha.
                    if (data.concluido && !wasDone && doneCount + 1 < total) {
                      setFeedback({
                        key: Date.now(),
                        pontos: h.pontos,
                        streak: data.streak.atual,
                        message: encouragement(doneCount + 1, total),
                      });
                    }
                  },
                },
              );
            }}
          />
        ) : (
          <EmptyHabits />
        )}
      </section>

      <CelebrationDrawer
        open={showCelebration}
        onOpenChange={setShowCelebration}
        pontos={state.pontos}
        streak={streak}
      />
    </div>
  );
}
