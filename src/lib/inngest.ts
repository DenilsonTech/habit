import { Inngest } from "inngest";
import { dispatchDueReminders } from "@/lib/reminders";

export const inngest = new Inngest({ id: "habitos" });

// Função agendada: a cada 5 min (hora de Maputo) dispara os lembretes de água
// devidos. O Inngest (cloud) invoca isto no horário — sem depender do GitHub.
export const remindersCron = inngest.createFunction(
  {
    id: "check-reminders",
    triggers: [{ cron: "TZ=Africa/Maputo */5 * * * *" }],
  },
  async ({ step }) => {
    return await step.run("dispatch-reminders", () => dispatchDueReminders());
  },
);
