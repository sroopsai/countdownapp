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
    if (!raw) return [];
    const parsed: CountdownEvent[] = JSON.parse(raw);

    // Strictly deduplicate by ID AND by (title + targetDate)
    const seenIds = new Set<string>();
    const seenEvents = new Set<string>();
    const deduplicated: CountdownEvent[] = [];

    for (const item of parsed) {
      if (!item || !item.id || !item.title || !item.targetDate) continue;
      const eventSignature = `${item.title.trim().toLowerCase()}__${item.targetDate}`;

      if (!seenIds.has(item.id) && !seenEvents.has(eventSignature)) {
        seenIds.add(item.id);
        seenEvents.add(eventSignature);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  } catch {
    return [];
  }
}

export function addEventToHistory(event: CountdownEvent): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredEventHistory();
    const eventSignature = `${event.title.trim().toLowerCase()}__${event.targetDate}`;

    // Remove any previous entry with matching id OR matching title + targetDate
    const filtered = history.filter((e) => {
      const sig = `${e.title.trim().toLowerCase()}__${e.targetDate}`;
      return e.id !== event.id && sig !== eventSignature;
    });

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
