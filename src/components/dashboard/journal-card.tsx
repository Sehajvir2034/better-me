"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface Props {
  data: { mood: string | null; hasEntry: boolean };
}

const moodConfig: Record<
  string,
  { emoji: string; color: string; label: string }
> = {
  great: { emoji: "😄", color: "text-emerald-400", label: "Feeling great" },
  good: { emoji: "🙂", color: "text-blue-400", label: "Feeling good" },
  neutral: { emoji: "😐", color: "text-yellow-400", label: "Feeling neutral" },
  bad: { emoji: "😔", color: "text-orange-400", label: "Feeling low" },
  awful: { emoji: "😢", color: "text-red-400", label: "Rough day" },
};

export function JournalCard({ data }: Props) {
  const mood = data.mood ? moodConfig[data.mood] : null;

  return (
    <Link href="/journal">
      <div className="group relative rounded-2xl bg-[#111128] border border-white/8 p-6 hover:border-amber-500/40 transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-600/5 to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Journal Insights
              </p>
              <p className="text-white font-bold text-lg">
                {data.hasEntry ? "Entry written today" : "No entry yet"}
              </p>
              {mood && <p className={`text-sm ${mood.color}`}>{mood.label}</p>}
            </div>
          </div>
          {mood && <span className="text-5xl">{mood.emoji}</span>}
        </div>
      </div>
    </Link>
  );
}
