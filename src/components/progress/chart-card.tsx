// Cartão-contentor para um gráfico da tela de progresso (título + conteúdo).
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-3xl bg-card p-5">
      <h3 className="text-[0.95rem] font-semibold">{title}</h3>
      {children}
    </section>
  );
}
