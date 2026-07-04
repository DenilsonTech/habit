"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

function greetingFor(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

export function HomeHeader() {
  const router = useRouter();
  const [info, setInfo] = useState({ greeting: "Olá", date: "" });

  useEffect(() => {
    const now = new Date();
    const date = new Intl.DateTimeFormat("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now);
    setInfo({
      greeting: greetingFor(now.getHours()),
      date: date.charAt(0).toUpperCase() + date.slice(1),
    });
  }, []);

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Perfil"
          onClick={() => router.push("/perfil")}
          className="flex size-11 items-center justify-center rounded-full bg-card text-muted-foreground"
        >
          <HugeiconsIcon icon={UserCircleIcon} size={26} strokeWidth={1.5} />
        </button>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight">{info.greeting}</p>
          <p className="text-xs text-muted-foreground">{info.date}</p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Notificações"
        onClick={() => router.push("/perfil/notificacoes")}
        className="relative flex size-11 items-center justify-center rounded-full bg-card text-foreground"
      >
        <HugeiconsIcon icon={Notification03Icon} size={22} strokeWidth={1.5} />
        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
      </button>
    </header>
  );
}
