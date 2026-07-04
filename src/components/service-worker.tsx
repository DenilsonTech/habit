"use client";

import { useEffect } from "react";

// Regista o service worker no arranque (necessário para instalabilidade PWA e,
// no futuro, cache offline). O push reutiliza este mesmo registo.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
