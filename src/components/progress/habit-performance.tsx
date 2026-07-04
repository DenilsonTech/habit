// Desempenho por hábito — barras horizontais (% de conclusão), série única verde.
export function HabitPerformance({
  items,
}: {
  items: { nome: string; pct: number }[];
}) {
  return (
    <div className="space-y-4">
      {items.map((h) => (
        <div key={h.nome} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{h.nome}</span>
            <span className="text-muted-foreground tabular-nums">{h.pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${h.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
