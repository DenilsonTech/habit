import { cn } from "@/lib/utils";

// Mapa de conclusões (heatmap tipo contribuições). Rampa sequencial de um só
// verde (vazio -> intenso) sobre o escuro. Recebe níveis reais por dia; se não,
// mostra um padrão de exemplo.
const DAYS = ["Se", "Te", "Qa", "Qi", "Sx", "Sá", "Do"]; // linhas: 2ª..Dom

const LEVEL_BG = [
  "bg-secondary",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

function weekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
// linha 0 = 2ª feira (Segunda). getUTCDay: Dom=0..Sáb=6.
function rowOf(dow: number): number {
  return (dow + 6) % 7;
}

function Cell({ level }: { level: number }) {
  return (
    <span
      className={cn(
        "size-3 shrink-0 rounded-[3px]",
        level < 0 ? "bg-transparent" : LEVEL_BG[level],
      )}
    />
  );
}

function Grid({ columns }: { columns: number[][] }) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-1">
        {DAYS.map((d) => (
          <span
            key={d}
            className="h-3 text-[0.6rem] leading-3 text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((lvl, ri) => (
              <Cell key={ri} level={lvl} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityHeatmap({
  levels,
  startDate,
}: {
  levels?: number[];
  startDate?: string;
}) {
  if (levels && startDate) {
    const firstRow = rowOf(weekday(startDate));
    const cols = Math.ceil((firstRow + levels.length) / 7);
    const columns: number[][] = Array.from({ length: cols }, () =>
      Array(7).fill(-1),
    );
    for (let i = 0; i < levels.length; i++) {
      const pos = firstRow + i;
      columns[Math.floor(pos / 7)][pos % 7] = levels[i];
    }
    return <Grid columns={columns} />;
  }

  // Fallback determinístico (sem dados).
  const columns = Array.from({ length: 17 }, (_, c) =>
    DAYS.map((_, r) => (r * 2 + c * 3 + ((c + r) % 4)) % 5),
  );
  return <Grid columns={columns} />;
}
