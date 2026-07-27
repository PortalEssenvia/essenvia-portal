import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ne_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export async function track(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties: properties as never,
      session_id: getSessionId(),
      user_id: data.user?.id ?? null,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (err) {
    // Never break UX on tracking failure
    console.warn("[track] failed", eventName, err);
  }
}