// Grupo de linhas de definições dentro de um cartão arredondado.
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {title && (
        <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
      )}
      <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card">
        {children}
      </div>
    </div>
  );
}
