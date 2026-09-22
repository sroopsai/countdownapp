import { useSyncExternalStore } from "react";
import { CountdownEvent } from "@/types/countdown";
import {
  getStoredActiveEvent,
  saveStoredActiveEvent,
  getStoredEventHistory,
  deleteStoredEvent as removeHistoryItem,
} from "./storage";

export const DEFAULT_INITIAL_EVENT: CountdownEvent = {
  id: "initial-event",
  title: "🚀 Big Milestone Launch",
  targetDate: "2026-10-01T12:00:00.000Z",
  createdAt: "2026-09-22T00:00:00.000Z",
  notes: "Count down to your upcoming milestone!",
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
      const shared: CountdownEvent = {
        id: "shared-" + Math.random().toString(36).substring(2, 8),
        title: titleParam,
        targetDate: targetParam,
        createdAt: new Date().toISOString(),
        notes: notesParam || undefined,
      };
      saveStoredActiveEvent(shared);
      cachedEvent = shared;
      return shared;
    }

    // 2. Check localStorage
    const stored = getStoredActiveEvent();
    if (stored) {
      cachedEvent = stored;
      return stored;
    }

    // 3. Fallback: 3 days in the future
    const target = new Date();
    target.setDate(target.getDate() + 3);
    target.setHours(12, 0, 0, 0);
    const freshDefault: CountdownEvent = {
      id: "event-" + Date.now(),
      title: "🚀 Big Product Launch",
      targetDate: target.toISOString(),
      createdAt: new Date().toISOString(),
      notes: "Get ready for the major reveal!",
    };
    saveStoredActiveEvent(freshDefault);
    cachedEvent = freshDefault;
    return freshDefault;
  }

  return cachedEvent || DEFAULT_INITIAL_EVENT;
}

const EMPTY_HISTORY: CountdownEvent[] = [];

let cachedHistory: CountdownEvent[] = EMPTY_HISTORY;
function getHistorySnapshot(): CountdownEvent[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  const stored = getStoredEventHistory();
  // Avoid returning new reference if contents are the same to prevent re-renders
  if (JSON.stringify(stored) !== JSON.stringify(cachedHistory)) {
    cachedHistory = stored;
  }
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
