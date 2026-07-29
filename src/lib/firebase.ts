import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

const firebaseConfig = {
  apiKey: "AIzaSyCo0GBIkkYnZPKcx4NQU5m1gdQ3ja03NNI",
  authDomain: "constante-renovacao.firebaseapp.com",
  projectId: "constante-renovacao",
  storageBucket: "constante-renovacao.firebasestorage.app",
  messagingSenderId: "81351640314",
  appId: "1:81351640314:web:77d9f5533f2ddd23fd7543",
  measurementId: "G-FN4XM8C1K4",
};

const VAPID_KEY = "BO9UPEfd2Qk8ZVOuK3FJjgA4K5Oei8cN_odRIXLOuRJKc4A31iVjPq-yEiVmc2Y78v0Ipxa50yyP8BCuo_fpB1Q";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!app) app = initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(app);
  return messaging;
}

export async function requestFcmToken(): Promise<string | null> {
  const m = getMessagingInstance();
  if (!m) return null;

  try {
    const currentToken = await getToken(m, { vapidKey: VAPID_KEY });
    if (!currentToken) return null;

    // Salva/atualiza no Supabase vinculado ao usuário logado
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return currentToken;

    const { error } = await supabase.from("push_tokens").upsert(
      {
        user_id: userId,
        token: currentToken,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          updatedAt: new Date().toISOString(),
        },
      },
      { onConflict: "token" }
    );

    if (error) {
      console.error("[fcm] erro ao salvar token:", error);
    }

    return currentToken;
  } catch (err) {
    console.error("[fcm] falha ao obter token:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void) {
  const m = getMessagingInstance();
  if (!m) return () => {};
  return onMessage(m, (payload) => {
    callback({
      notification: {
        title: payload.notification?.title,
        body: payload.notification?.body,
      },
      data: payload.data as Record<string, string> | undefined,
    });
  });
}

export function isFirebaseSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;
}
