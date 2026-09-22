import { Metadata } from "next";
import Link from "next/link";
import { getEventFromDb } from "@/lib/db";
import CountdownDisplay from "@/components/CountdownDisplay";
import { Timer, ArrowLeft, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventFromDb(id);

  if (!event) {
    return {
      title: "Countdown Not Found — CountdownApp",
    };
  }

  return {
    title: `${event.title} — CountdownApp`,
    description: `Counting down to ${event.title}. Live real-time timer.`,
  };
}

export default async function SharedCountdownPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventFromDb(id);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg">
          <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-4 flex items-center justify-center">
            <Timer className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Countdown Not Found</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This event may have been removed or the link is invalid.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" /> Create a Countdown
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Timer className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              CountdownApp
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Countdowns</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="w-full py-8 sm:py-12">
          <CountdownDisplay event={event} />
        </div>
      </main>

      <footer className="w-full py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <p>Built with Next.js, Neon & Tailwind CSS</p>
      </footer>
    </div>
  );
}
