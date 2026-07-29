// Guarded service worker registration. Never runs in Lovable preview/dev/iframe.
import { registerSW } from "virtual:pwa-register";

const BLOCKED_HOST_PATTERNS = [
  /^id-preview--/,
  /^preview--/,
  /(^|\.)lovableproject\.com$/,
  /(^|\.)lovableproject-dev\.com$/,
  /(^|\.)beta\.lovable\.dev$/,
];

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.top !== window.self) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (BLOCKED_HOST_PATTERNS.some((rx) => rx.test(host))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => {
        const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
        return /\/sw\.js(\?|$)/.test(url) || /\/service-worker\.js(\?|$)/.test(url);
      })
      .map((r) => r.unregister()),
  );
}

export function initPWA() {
  if (isBlockedContext()) {
    void unregisterAppWorkers();
    return;
  }
  registerSW({
    immediate: true,
    onRegistered(r) {
      if (r) {
        console.log("[pwa] service worker registrado:", r.scope);
      }
    },
    onRegisterError(err) {
      console.error("[pwa] erro ao registrar service worker:", err);
    },
  });
}
