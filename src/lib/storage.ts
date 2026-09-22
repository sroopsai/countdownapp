import { CountdownEvent } from "@/types/countdown";

const ACTIVE_EVENT_KEY = "countdownapp_active_event";
const EVENT_HISTORY_KEY = "countdownapp_event_history";

export function getStoredActiveEvent(): CountdownEvent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_EVENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read active event from localStorage", e);
    return null;
  }
}

export function saveStoredActiveEvent(event: CountdownEvent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_EVENT_KEY, JSON.stringify(event));
    addEventToHistory(event);
  } catch (e) {
    console.error("Failed to save active event to localStorage", e);
  }
}

export function getStoredEventHistory(): CountdownEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addEventToHistory(event: CountdownEvent): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredEventHistory();
    const filtered = history.filter((e) => e.id !== event.id);
    const updated = [event, ...filtered].slice(0, 10);
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update event history", e);
  }
}

export function deleteStoredEvent(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredEventHistory();
    const updated = history.filter((e) => e.id !== id);
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete event from history", e);
  }
}
