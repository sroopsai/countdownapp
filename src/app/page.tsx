"use client";

import { useState } from "react";
import CountdownDisplay from "@/components/CountdownDisplay";
import CountdownForm from "@/components/CountdownForm";
import { CountdownEvent } from "@/types/countdown";
import { Timer, Plus, Edit3, Sparkles } from "lucide-react";

export default function Home() {
  // Default Phase 0 event: 3 days from now
  const [currentEvent, setCurrentEvent] = useState<CountdownEvent>(() => {
    const target = new Date();
    target.setDate(target.getDate() + 3);
    target.setHours(12, 0, 0, 0);

    return {
      id: "initial-event",
      title: "🚀 Big Product Launch",
      targetDate: target.toISOString(),
      createdAt: new Date().toISOString(),
      notes: "Get ready for the major reveal!",
    };
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSaveEvent = (savedEvent: CountdownEvent) => {
    setCurrentEvent(savedEvent);
    setIsEditing(false);
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
                Phase 0 MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Target</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition"
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
          <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12">
            <CountdownDisplay
              key={`${currentEvent.id}-${currentEvent.targetDate}`}
              event={currentEvent}
              onEdit={() => setIsEditing(true)}
            />

            {/* Sub-card actions */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Change Target Date
              </button>

              <button
                onClick={() => {
                  const quickDate = new Date(Date.now() + 10 * 1000); // 10 seconds quick test
                  setCurrentEvent({
                    id: "test-10s",
                    title: "⚡ 10-Second Test Blast",
                    targetDate: quickDate.toISOString(),
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test 10-Sec Celebration
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <p>Built with Next.js & Tailwind CSS • Ready for Vercel</p>
      </footer>
    </div>
  );
}
