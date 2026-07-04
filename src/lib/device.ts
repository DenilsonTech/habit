// Identidade anónima do dispositivo (PRD secção 2.1): um UUID gerado no browser
// e guardado em localStorage. Não há login — este ID associa todos os dados.
// A criação do registo `devices` no backend acontece no onboarding.

const STORAGE_KEY = "device_id";

/** Lê o device_id guardado, ou null se ainda não existe (ex: antes do onboarding). */
export function getStoredDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

/** Lê o device_id, criando-o se ainda não existir. Só corre no browser. */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateDeviceId só pode correr no browser.");
  }
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/** Remove o device_id local (usado no reset de dados do Perfil). */
export function clearDeviceId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
