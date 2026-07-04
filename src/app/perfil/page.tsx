"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlarmClockIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Door01Icon,
  DropletIcon,
  GlassWaterIcon,
  Home01Icon,
  Notification03Icon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsGroup } from "@/components/settings/settings-group";
import { SettingRow } from "@/components/settings/setting-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { clearDeviceId } from "@/lib/device";

export default function PerfilPage() {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  function doReset() {
    clearDeviceId();
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-safe pb-10">
      <SettingsHeader title="Perfil" />

      {/* Identidade (anónima) */}
      <div className="mt-4 flex flex-col items-center gap-3 py-2">
        <div className="flex size-20 items-center justify-center rounded-full bg-card text-muted-foreground">
          <HugeiconsIcon icon={UserCircleIcon} size={44} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">O teu perfil</p>
          <p className="text-xs text-muted-foreground">
            Sem conta · os dados ficam só neste dispositivo
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <SettingsGroup title="Perfil">
          <SettingRow icon={UserIcon} label="Idade" value="23 anos" onClick={() => {}} />
          <SettingRow icon={AlarmClockIcon} label="Acordar" value="05:00" onClick={() => {}} />
          <SettingRow icon={Door01Icon} label="Sair de casa" value="06:00" onClick={() => {}} />
          <SettingRow icon={Home01Icon} label="Chegar a casa" value="20:30" onClick={() => {}} />
        </SettingsGroup>

        <SettingsGroup title="Água">
          <SettingRow icon={DropletIcon} label="Meta diária" value="8 copos" onClick={() => {}} />
          <SettingRow icon={GlassWaterIcon} label="Tamanho do copo" value="250 ml" onClick={() => {}} />
          <SettingRow
            icon={Clock01Icon}
            label="Lembretes de água"
            value="7 horários"
            onClick={() => router.push("/perfil/notificacoes")}
          />
        </SettingsGroup>

        <SettingsGroup title="Geral">
          <SettingRow
            icon={CheckmarkCircle02Icon}
            label="Os meus hábitos"
            onClick={() => router.push("/perfil/habitos")}
          />
          <SettingRow
            icon={Notification03Icon}
            label="Notificações"
            onClick={() => router.push("/perfil/notificacoes")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingRow
            icon={Delete02Icon}
            label="Apagar todos os dados"
            danger
            onClick={() => setResetOpen(true)}
          />
        </SettingsGroup>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Apagar todos os dados?"
        description="Isto apaga o teu perfil e histórico deste dispositivo. Não pode ser anulado."
        confirmLabel="Apagar"
        danger
        onConfirm={doReset}
      />
    </div>
  );
}
