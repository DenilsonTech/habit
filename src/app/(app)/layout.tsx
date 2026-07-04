import { BottomNav } from "@/components/bottom-nav";

// Shell das abas principais. O onboarding vive fora deste grupo (sem bottom nav).
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* pb generoso para a bottom nav flutuante não tapar o fim do conteúdo. */}
      <main className="flex-1 px-5 pb-32 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
