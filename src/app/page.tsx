"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function Home() {
  const [currentEvent, setCurrentEvent] = useActiveCountdown();
  const [history, deleteHistoryItem] = useCountdownHistory();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const isMounted = useMounted();

  const handleSaveEvent = (savedEvent: CountdownEvent) => {
    setCurrentEvent(savedEvent);
    setIsEditing(false);
  };

  const handleSelectHistoryEvent = (event: CountdownEvent) => {
    setCurrentEvent(event);
    setIsEditing(false);
  };

  const handleDeleteHistoryEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("title", currentEvent.title);
    url.searchParams.set("target", currentEvent.targetDate);
    if (currentEvent.notes) {
      url.searchParams.set("notes", currentEvent.notes);
    }

    navigator.clipboard.writeText(url.toString()).then(() => {
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
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                Phase 1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-zinc-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Target</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {isEditing ? (
          <div className="w-full animate-fade-in my-6">
            <CountdownForm
              initialEvent={currentEvent}
              onSave={handleSaveEvent}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-6 sm:py-10">
            <CountdownDisplay
              key={`${currentEvent.id}-${currentEvent.targetDate}`}
              event={currentEvent}
              onEdit={() => setIsEditing(true)}
            />

            {/* Sub-card actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Change Target Date
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test 10-Sec Celebration
              </button>
            </div>

            {/* Saved Countdowns Section (localStorage persistence) */}
            {isMounted && history.length > 0 && (
              <div className="mt-14 w-full max-w-2xl border-t border-zinc-200 dark:border-zinc-800/80 pt-8">
                <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <History className="w-4 h-4" />
                  <span>Saved in your Browser ({history.length})</span>
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
                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
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
        <p>Built with Next.js & Tailwind CSS • Auto-saved to Browser</p>
      </footer>
    </div>
  );
}
