// Barras da atividade semanal — série única (verde), totalmente arredondadas
// (cápsula), sem grelha. Ancoradas à baseline.
export function WeeklyActivityChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className="w-7 rounded-full bg-primary"
              style={{ height: `${Math.max(12, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[0.7rem] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
