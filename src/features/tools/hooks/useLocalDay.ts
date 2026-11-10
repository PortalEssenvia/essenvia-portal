import { useSyncExternalStore } from "react";
import { localDateKey } from "../constants";

let day = localDateKey(new Date());
const listeners = new Set<() => void>();
function checkDay() {
  const next = localDateKey(new Date());
  if (next !== day) { day = next; listeners.forEach((notify) => notify()); }
}
function subscribe(notify: () => void) {
  listeners.add(notify);
  checkDay();
  const interval = window.setInterval(checkDay, 60_000);
  document.addEventListener("visibilitychange", checkDay);
  return () => { listeners.delete(notify); clearInterval(interval); document.removeEventListener("visibilitychange", checkDay); };
}
export function useLocalDay() {
  return useSyncExternalStore(subscribe, () => day);
}