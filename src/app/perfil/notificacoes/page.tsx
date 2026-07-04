"use client";

import { useEffect, useState } from "react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsGroup } from "@/components/settings/settings-group";
import { SettingRow } from "@/components/settings/setting-row";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReminderTimesEditor } from "@/components/reminder-times";
import { getStoredDeviceId } from "@/lib/device";
import {
  isSubscribed,
  sendTestPush,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

export default function NotificacoesPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [permitir, setPermitir] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [aguaOn, setAguaOn] = useState(true);
  const [horarios, setHorarios] = useState([
    "05:15",
    "07:30",
    "10:00",
    "12:30",
    "15:30",
    "18:00",
    "20:30",
  ]);

  useEffect(() => {
    setDeviceId(getStoredDeviceId());
    isSubscribed()
      .then(setPermitir)
      .catch(() => {});
  }, []);

  async function onTogglePermitir(next: boolean) {
    if (!deviceId) return;
    setBusy(true);
    setMsg(null);
    try {
      if (next) {
        await subscribeToPush(deviceId);
        setPermitir(true);
      } else {
        await unsubscribeFromPush();
        setPermitir(false);
      }
    } catch (e) {
      setPermitir(false);
      setMsg(e instanceof Error ? e.message : "Não foi possível.");
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    if (!deviceId) return;
    setBusy(true);
    setMsg(null);
    try {
      const n = await sendTestPush(deviceId);
      setMsg(n > 0 ? "Notificação enviada." : "Nenhuma subscrição para enviar.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-6 pb-10">
      <SettingsHeader title="Notificações" />

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <SettingsGroup>
            <SettingRow
              icon={Notification03Icon}
              label="Permitir notificações"
              trailing={
                <Switch
                  checked={permitir}
                  disabled={busy}
                  onCheckedChange={onTogglePermitir}
                />
              }
            />
          </SettingsGroup>
          <p className="px-1 text-xs text-muted-foreground">
            Recebe lembretes de água mesmo com a app fechada.
          </p>

          <Button
            variant="secondary"
            onClick={onTest}
            disabled={busy || !permitir}
            className="h-12 w-full rounded-full"
          >
            Enviar notificação de teste
          </Button>
          {msg && (
            <p className="px-1 text-center text-xs text-muted-foreground">
              {msg}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Lembretes de água
          </h2>
          <div className="space-y-4 rounded-3xl bg-card p-4">
            <div className="flex items-center justify-between">
              <Label>Ativar lembretes</Label>
              <Switch checked={aguaOn} onCheckedChange={setAguaOn} />
            </div>
            {aguaOn && (
              <ReminderTimesEditor times={horarios} onChange={setHorarios} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
