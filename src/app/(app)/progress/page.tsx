"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar01Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  Medal01Icon,
} from "@hugeicons/core-free-icons";
import { getStoredDeviceId } from "@/lib/device";
import { useProgress } from "@/lib/queries";
import { PeriodSelector } from "@/components/progress/period-selector";
import { StatCard } from "@/components/progress/stat-card";
import { ChartCard } from "@/components/progress/chart-card";
import { WeeklyActivityChart } from "@/components/progress/weekly-activity-chart";
import { HabitPerformance } from "@/components/progress/habit-performance";
import { ActivityHeatmap } from "@/components/progress/activity-heatmap";

export default function ProgressPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceChecked, setDeviceChecked] = useState(false);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    setDeviceId(getStoredDeviceId());
    setDeviceChecked(true);
  }, []);
  useEffect(() => {
    if (deviceChecked && !deviceId) router.replace("/onboarding");
  }, [deviceChecked, deviceId, router]);

  const { data } = useProgress(deviceId, Number(period));

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">
        As suas tendências
      </h1>

      {/* Seletor de período fixo (sticky) */}
      <div className="sticky top-0 z-30 -mx-5 bg-background px-5 py-2">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {!data ? (
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="h-40 w-44 animate-pulse rounded-3xl bg-card" />
            <div className="h-40 w-44 animate-pulse rounded-3xl bg-card" />
          </div>
          <div className="h-52 animate-pulse rounded-3xl bg-card" />
          <div className="h-52 animate-pulse rounded-3xl bg-card" />
        </div>
      ) : (
        <>
          {/* Stat cards — scroll horizontal */}
          <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5">
            <StatCard
              label="Pontuação"
              value={`${data.pontuacao}%`}
              icon={DashboardSpeed01Icon}
            />
            <StatCard
              label="Conclusões"
              value={String(data.conclusoes)}
              icon={Database01Icon}
            />
            <StatCard
              label="Dias de sequência"
              value={String(data.sequencia)}
              icon={Medal01Icon}
            />
            <StatCard label="Melhor dia" value={data.melhorDia} icon={Calendar01Icon} />
          </div>

          <ChartCard title="Atividade semanal">
            <WeeklyActivityChart data={data.weekly} />
          </ChartCard>

          <ChartCard title="Desempenho dos hábitos">
            <HabitPerformance items={data.performance} />
          </ChartCard>

          <ChartCard title="Mapa de conclusões">
            <ActivityHeatmap levels={data.heatmap} startDate={data.startDate} />
          </ChartCard>
        </>
      )}
    </div>
  );
}
