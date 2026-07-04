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
import { CelebrationDrawer } from "@/components/home/celebration-drawer";

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
  const todayPct = total ? Math.round((doneCount / total) * 100) : 0;
  // Contagem da secção "Hábitos de hoje" = só a timeline (exclui a água, que
  // aparece nos copos, não na lista).
  const timelineDone = timeline.filter((h) => state.logs[h.id]?.concluido).length;
  const streakVals = Object.values(state.streaks).map((s) => s.atual);
  const streak = streakVals.length ? Math.max(...streakVals) : 0;

  return (
    <div className="space-y-5">
      <HomeHeader />

      <DailyProgressCard
        todayPct={todayPct}
        last30Pct={0}
        streak={streak}
        cups={cups}
        cupsGoal={cupsGoal}
        onSetCups={(n) => {
          if (agua) logHabit.mutate({ habitId: agua.id, valor: n * cupMl });
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
            }))}
            onToggle={(slug) => {
              const h = timeline.find((x) => x.slug === slug);
              if (h) {
                logHabit.mutate({
                  habitId: h.id,
                  concluido: !(state.logs[h.id]?.concluido ?? false),
                });
              }
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
