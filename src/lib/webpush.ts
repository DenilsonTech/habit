import webpush from "web-push";

// Configura o web-push com as chaves VAPID (server-only). Se faltarem chaves,
// não configura — as rotas verificam antes de enviar.
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:dondzalandia@gmail.com",
    publicKey,
    privateKey,
  );
}

export const isPushConfigured = Boolean(publicKey && privateKey);
export { webpush };
