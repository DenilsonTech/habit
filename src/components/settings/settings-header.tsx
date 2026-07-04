"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

// Header de ecrãs de definições: botão voltar + título centrado.
export function SettingsHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="relative flex items-center justify-center pb-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Voltar"
        className="absolute left-0 flex size-9 items-center justify-center rounded-full bg-card text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
      </button>
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
