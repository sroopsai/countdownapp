"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { CountdownEvent, TimeRemaining } from "@/types/countdown";
import { calculateTimeRemaining, formatDigit, formatReadableDate } from "@/lib/time";
import { Calendar, Clock, Sparkles, CheckCircle2 } from "lucide-react";

interface CountdownDisplayProps {
  event: CountdownEvent;
  onEdit?: () => void;
}

export default function CountdownDisplay({ event, onEdit }: CountdownDisplayProps) {
  const [time, setTime] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(event.targetDate)
  );
  const prevIsCompleteRef = useRef<boolean>(time.isComplete);

  const triggerConfetti = useCallback(() => {
    if (typeof window === "undefined") return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  useEffect(() => {
    prevIsCompleteRef.current = calculateTimeRemaining(event.targetDate).isComplete;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(event.targetDate);
      setTime(remaining);

      // Trigger celebration when transitioning from active to complete
      if (remaining.isComplete && !prevIsCompleteRef.current) {
        triggerConfetti();
      }
      prevIsCompleteRef.current = remaining.isComplete;
    }, 500);

    return () => clearInterval(interval);
  }, [event.targetDate, triggerConfetti]);

  const units = [
    { label: "DAYS", value: formatDigit(time.days) },
    { label: "HOURS", value: formatDigit(time.hours) },
    { label: "MINUTES", value: formatDigit(time.minutes) },
    { label: "SECONDS", value: formatDigit(time.seconds) },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Event Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <Clock className="w-3.5 h-3.5" />
          {time.isComplete ? "Event Completed" : "Countdown in progress"}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {event.title}
        </h1>
        {event.notes && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            {event.notes}
          </p>
        )}
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Calendar className="w-4 h-4" />
          <span>{formatReadableDate(event.targetDate)}</span>
        </div>
      </div>

      {/* Completion Banner */}
      {time.isComplete ? (
        <div className="w-full p-6 mb-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-fade-in">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            The moment has arrived! 🎉
          </h2>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            This event target was reached.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={triggerConfetti}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Celebrate Again
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
              >
                Set New Target
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Ticking Digit Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 w-full">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md"
          >
            <span className="font-mono text-4xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {unit.value}
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
