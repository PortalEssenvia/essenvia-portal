/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/client" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Firebase Messaging no SW
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyCo0GBIkkYnZPKcx4NQU5m1gdQ3ja03NNI",
  authDomain: "constante-renovacao.firebaseapp.com",
  projectId: "constante-renovacao",
  storageBucket: "constante-renovacao.firebasestorage.app",
  messagingSenderId: "81351640314",
  appId: "1:81351640314:web:77d9f5533f2ddd23fd7543",
  measurementId: "G-FN4XM8C1K4",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title || "Nova Essenvia";
  const body = payload.notification?.body || "Hora da sua prática diária ✨";
  const icon = "/logo.png";
  const badge = "/logo.png";
  const tag = payload.data?.tag || "practice-reminder";

  const snoozeMin = Number(payload.data?.snooze_min || 10);

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    tag,
    data: payload.data,
    requireInteraction: true,
    actions: [
      { action: "open", title: "Abrir" },
      { action: "snooze", title: `Soneca ${snoozeMin} min` },
    ],
  });
});

// Workbox PWA default behavior
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

// Precache build output
try {
  precacheAndRoute(self.__WB_MANIFEST);
} catch {
  // fallback caso __WB_MANIFEST não esteja disponível em dev
}

cleanupOutdatedCaches();

// Navigation: NetworkFirst, exceto rotas de OAuth/API
registerRoute(
  ({ request, url }: { request: Request; url: URL }) =>
    request.mode === "navigate" && !url.pathname.startsWith("/~oauth") && !url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "html-nav",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
);

// Scripts/estilos: sempre revalidar na rede (evita servir bundles antigos
// que já não existem no servidor e quebram o carregamento do app).
registerRoute(
  ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
    sameOrigin && ["style", "script", "worker"].includes(request.destination),
  new NetworkFirst({
    cacheName: "assets-code",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);

// Fontes e imagens: CacheFirst (conteúdo imutável)
registerRoute(
  ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
    sameOrigin && ["font", "image"].includes(request.destination),
  new CacheFirst({
    cacheName: "assets-media",
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

const SNOOZE_ENDPOINT = "https://nubpxsrhnaulmxokhrgb.supabase.co/functions/v1/snooze-reminder";

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  // Ação "Soneca": reagenda o lembrete no servidor e não abre o app.
  if (event.action === "snooze" && !data.snooze_token) {
    // Lembrete local (app aberto): devolve para a página reagendar.
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
        list.forEach((c) =>
          c.postMessage({
            type: "snooze-local",
            practice_key: data.practice_key,
            minutes: Number(data.snooze_min || 10),
          }),
        );
      }),
    );
    return;
  }

  if (event.action === "snooze" && data.snooze_token) {
    event.waitUntil(
      fetch(SNOOZE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.snooze_token, minutes: Number(data.snooze_min || 10) }),
      }).catch(() => undefined),
    );
    return;
  }

  const urlToOpen = data.url || "/ferramentas";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});
