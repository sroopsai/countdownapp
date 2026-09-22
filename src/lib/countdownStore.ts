import { useSyncExternalStore } from "react";
import { CountdownEvent } from "@/types/countdown";
import {
  getStoredActiveEvent,
  saveStoredActiveEvent,
  getStoredEventHistory,
  deleteStoredEvent as removeHistoryItem,
} from "./storage";

export const DEFAULT_INITIAL_EVENT: CountdownEvent = {
  id: "default-milestone-event",
  title: "🚀 Big Product Launch",
  targetDate: "2026-10-01T12:00:00.000Z",
  createdAt: "2026-09-22T00:00:00.000Z",
  notes: "Get ready for the major reveal!",
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

let cachedEvent: CountdownEvent | null = null;
let initialized = false;

function getActiveEventSnapshot(): CountdownEvent {
  if (typeof window === "undefined") {
    return DEFAULT_INITIAL_EVENT;
  }

  if (!initialized) {
    initialized = true;

    // 1. Check URL parameters (?title=...&target=...)
    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get("title");
    const targetParam = params.get("target");
    const notesParam = params.get("notes");

    if (titleParam && targetParam) {
      // Check if event already exists in history to reuse ID
      const history = getStoredEventHistory();
      const existing = history.find(
        (e) =>
          e.title.trim().toLowerCase() === titleParam.trim().toLowerCase() &&
          e.targetDate === targetParam
      );

      const sharedId =
        existing?.id ||
        "shared-" +
          Math.abs(
            (titleParam + targetParam).split("").reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)
          ).toString(36);

      const shared: CountdownEvent = {
        id: sharedId,
        title: titleParam,
        targetDate: targetParam,
        createdAt: existing?.createdAt || new Date().toISOString(),
        notes: notesParam || existing?.notes || undefined,
      };

      saveStoredActiveEvent(shared);
      cachedEvent = shared;

      // Clean query parameters from URL bar to prevent duplicate imports on refresh
      try {
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }

      return shared;
    }

    // 2. Check localStorage
    const stored = getStoredActiveEvent();
    if (stored) {
      cachedEvent = stored;
      return stored;
    }

    // 3. Fallback to constant default event (do not invent random ID)
    saveStoredActiveEvent(DEFAULT_INITIAL_EVENT);
    cachedEvent = DEFAULT_INITIAL_EVENT;
    return DEFAULT_INITIAL_EVENT;
  }

  return cachedEvent || DEFAULT_INITIAL_EVENT;
}

const EMPTY_HISTORY: CountdownEvent[] = [];
let cachedHistory: CountdownEvent[] = EMPTY_HISTORY;

function getHistorySnapshot(): CountdownEvent[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  const stored = getStoredEventHistory();

  // Return same reference if items are identical
  if (
    stored.length === cachedHistory.length &&
    stored.every((item, i) => item.id === cachedHistory[i]?.id)
  ) {
    return cachedHistory;
  }

  cachedHistory = stored;
  return cachedHistory;
}

export function useActiveCountdown(): [CountdownEvent, (event: CountdownEvent) => void] {
  const event = useSyncExternalStore(
    subscribe,
    getActiveEventSnapshot,
    () => DEFAULT_INITIAL_EVENT
  );

  const setEvent = (next: CountdownEvent) => {
    cachedEvent = next;
    saveStoredActiveEvent(next);
    emitChange();
  };

  return [event, setEvent];
}

export function useCountdownHistory(): [CountdownEvent[], (id: string) => void] {
  const history = useSyncExternalStore(
    subscribe,
    getHistorySnapshot,
    () => EMPTY_HISTORY
  );

  const deleteItem = (id: string) => {
    removeHistoryItem(id);
    emitChange();
  };

  return [history, deleteItem];
}
