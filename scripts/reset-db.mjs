// Reset da base de dados (dev): apaga TODOS os devices e, por cascade, todos
// os dados associados (perfis, hábitos, logs, streaks, pontuação, subscrições
// de push, water_config, reminder_dispatch_log). Deixa as tabelas vazias — o
// próximo onboarding recria só a água como hábito default.
//
//   pnpm reset-db            -> dry-run (só mostra quantos devices existem)
//   pnpm reset-db --confirm  -> apaga mesmo
import "dotenv/config";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL em falta (.env).");
  process.exit(1);
}

const confirmed = process.argv.includes("--confirm");
const client = new Client({ connectionString: url });
await client.connect();

try {
  const { rows } = await client.query("SELECT count(*)::int AS n FROM devices");
  console.log(`Devices atuais na base de dados: ${rows[0].n}`);

  if (!confirmed) {
    console.log(
      "\nDry-run. Para apagar TUDO, corre:\n  pnpm reset-db --confirm",
    );
  } else {
    await client.query("TRUNCATE TABLE devices CASCADE");
    console.log("\n✅ Base de dados limpa. Todas as tabelas vazias.");
  }
} finally {
  await client.end();
}
