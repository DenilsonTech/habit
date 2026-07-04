// Fundo decorativo partilhado pelos passos do onboarding: glow verde no topo +
// grain subtil (SVG feTurbulence inline, sem asset externo). Sem interação.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function OnboardingBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 78% at 50% -8%, rgba(34,197,94,0.62) 0%, rgba(34,197,94,0.24) 24%, rgba(16,185,129,0.08) 44%, rgba(10,10,11,0) 66%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
