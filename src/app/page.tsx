"use client";

import { useState, useEffect } from "react";
import CountdownDisplay from "@/components/CountdownDisplay";
import CountdownForm from "@/components/CountdownForm";
import { CountdownEvent } from "@/types/countdown";
import { useActiveCountdown, useCountdownHistory } from "@/lib/countdownStore";
import { useMounted } from "@/lib/useMounted";
import {
  Timer,
  Plus,
  Edit3,
  Sparkles,
  Share2,
  Check,
  History,
  Trash2,
  CalendarPlus,
  Database,
} from "lucide-react";

export default function Home() {
  const [currentEvent, setCurrentEvent] = useActiveCountdown();
  const [history, deleteHistoryItem] = useCountdownHistory();
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasDb, setHasDb] = useState<boolean>(false);
  const isMounted = useMounted();

  // Check if Neon database is configured
  useEffect(() => {
    let isCancelled = false;
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.hasDb) {
          setHasDb(true);
        }
      })
      .catch(() => {
        // graceful offline / fallback
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSaveEvent = async (savedEvent: CountdownEvent) => {
    setCurrentEvent(savedEvent);
    setFormMode(null);

    // If Neon DB is connected, save to DB in background
    if (hasDb) {
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedEvent),
        });
      } catch (err) {
        console.warn("Failed to sync event to Neon database:", err);
      }
    }
  };

  const handleSelectHistoryEvent = (event: CountdownEvent) => {
    setCurrentEvent(event);
    setFormMode(null);
  };

  const handleDeleteHistoryEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);

    if (hasDb) {
      try {
        await fetch(`/api/events/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Failed to delete event from Neon database:", err);
      }
    }
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;

    let shareUrl: string;
    if (hasDb && currentEvent.id) {
      // Clean short permalink when database is connected
      shareUrl = `${window.location.origin}/c/${currentEvent.id}`;
    } else {
      // Portable URL query parameter link
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set("title", currentEvent.title);
      url.searchParams.set("target", currentEvent.targetDate);
      if (currentEvent.notes) {
        url.searchParams.set("notes", currentEvent.notes);
      }
      shareUrl = url.toString();
    }

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Navigation */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                CountdownApp
              </span>
            </div>

            {/* Storage status badge */}
            <div className="hidden md:flex items-center ml-2">
              {hasDb ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Database className="w-3 h-3" /> Neon DB Active
                </span>
              ) : (
                <span
                  title="To connect Neon Postgres, add DATABASE_URL to your .env.local file or Vercel dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                >
                  <Database className="w-3 h-3" /> Browser Storage
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {formMode === null ? (
              <>
                <button
                  onClick={() => setFormMode("edit")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => setFormMode("create")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Event</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setFormMode(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {formMode !== null ? (
          <div className="w-full animate-fade-in my-6">
            <CountdownForm
              initialEvent={formMode === "edit" ? currentEvent : null}
              onSave={handleSaveEvent}
              onCancel={() => setFormMode(null)}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-6 sm:py-10">
            <CountdownDisplay
              key={`${currentEvent.id}-${currentEvent.targetDate}`}
              event={currentEvent}
              onEdit={() => setFormMode("edit")}
            />

            {/* Sub-card actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setFormMode("create")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Event
              </button>

              <button
                onClick={() => setFormMode("edit")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 transition shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-zinc-500" />
                Edit Target
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-zinc-500" />
                {copied ? "Copied Link!" : "Copy Share Link"}
              </button>

              <button
                onClick={() => {
                  const quickDate = new Date(Date.now() + 10 * 1000); // 10 seconds test
                  const testEvent: CountdownEvent = {
                    id: "test-10s",
                    title: "⚡ 10-Second Test Blast",
                    targetDate: quickDate.toISOString(),
                    createdAt: new Date().toISOString(),
                  };
                  setCurrentEvent(testEvent);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-100 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test 10-Sec Celebration
              </button>
            </div>

            {/* Saved Countdowns Section */}
            {isMounted && history.length > 0 && (
              <div className="mt-14 w-full max-w-2xl border-t border-zinc-200 dark:border-zinc-800/80 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <History className="w-4 h-4" />
                    <span>Saved Countdowns ({history.length})</span>
                  </div>
                  <button
                    onClick={() => setFormMode("create")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Add New Event</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {history.map((item) => {
                    const isSelected = item.id === currentEvent.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectHistoryEvent(item)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500/20"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {new Date(item.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                              Active
                            </span>
                          )}
                          <button
                            title="Delete event"
                            onClick={(e) => handleDeleteHistoryEvent(item.id, e)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <p>Built with Next.js, Neon Postgres & Tailwind CSS • Ready for Vercel</p>
      </footer>
    </div>
  );
}
