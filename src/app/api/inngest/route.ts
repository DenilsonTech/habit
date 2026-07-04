import { serve } from "inngest/next";
import { inngest, remindersCron } from "@/lib/inngest";

// Endpoint que o Inngest invoca (App Router: GET/POST/PUT).
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [remindersCron],
});
