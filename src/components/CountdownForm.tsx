"use client";

import { useState, FormEvent } from "react";
import { CountdownEvent } from "@/types/countdown";
import { toDatetimeLocalValue } from "@/lib/time";
import { Calendar, Tag, Sparkles, X, FileText } from "lucide-react";

interface CountdownFormProps {
  initialEvent?: CountdownEvent | null;
  onSave: (event: CountdownEvent) => void;
  onCancel?: () => void;
}

export default function CountdownForm({
  initialEvent,
  onSave,
  onCancel,
}: CountdownFormProps) {
  const getDefaultTarget = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return toDatetimeLocalValue(d);
  };

  const [title, setTitle] = useState(initialEvent?.title || "My Milestone Event");
  const [targetDateStr, setTargetDateStr] = useState(
    initialEvent ? toDatetimeLocalValue(new Date(initialEvent.targetDate)) : getDefaultTarget()
  );
  const [notes, setNotes] = useState(initialEvent?.notes || "");
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (hoursFromNow: number, label: string) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    setTargetDateStr(toDatetimeLocalValue(d));
    if (!title || title === "My Milestone Event") {
      setTitle(label);
    }
  };

  const applyNewYearPreset = () => {
    const nextYear = new Date().getFullYear() + 1;
    const newYearDate = new Date(nextYear, 0, 1, 0, 0, 0);
    setTargetDateStr(toDatetimeLocalValue(newYearDate));
    setTitle(`New Year ${nextYear}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an event name.");
      return;
    }
    const parsedDate = new Date(targetDateStr);
    if (isNaN(parsedDate.getTime())) {
      setError("Please provide a valid date and time.");
      return;
    }

    const newEvent: CountdownEvent = {
      id: initialEvent?.id || Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      targetDate: parsedDate.toISOString(),
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    onSave(newEvent);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-lg"
    >
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {initialEvent ? "Edit Countdown" : "Create Countdown"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set your target date and watch the time tick down.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
          Event Name
        </label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Product Launch, Vacation, Birthday"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Target Date & Time */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
          Target Date & Time
        </label>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="datetime-local"
            required
            value={targetDateStr}
            onChange={(e) => {
              setTargetDateStr(e.target.value);
              setError(null);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Optional Notes */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
          Notes (Optional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a short subtitle or description"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Quick Presets
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset(1, "1 Hour Countdown")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
          >
            +1 Hour
          </button>
          <button
            type="button"
            onClick={() => applyPreset(24, "Tomorrow's Goal")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => applyPreset(24 * 7, "Next Week Milestone")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
          >
            In 1 Week
          </button>
          <button
            type="button"
            onClick={applyNewYearPreset}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 transition border border-indigo-200 dark:border-indigo-800 cursor-pointer"
          >
            🎆 New Year
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
        >
          {initialEvent ? "Update Countdown" : "Start Countdown"}
        </button>
      </div>
    </form>
  );
}
