import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { ConflictAlert } from "@/lib/skincare-ingredients";

interface Props {
  conflicts: ConflictAlert[];
}

export function ConflictAlerts({ conflicts }: Props) {
  return (
    <div className="rounded-2xl bg-[#1e2235]  overflow-hidden font-satoshi">
      {/* Header */}
      <div className="flex justify-center px-4 py-3.5 border-b border-white/6">
        <div className="flex items-center">
          <p className="text-base font-semibold capitalize tracking-wider text-amber-400">
            Product Conflict Alerts
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {conflicts.length === 0 ? (
          <p className="text-white/45 font-medium text-sm font-satoshi text-center py-3">
            No conflicts detected in your current routine.
          </p>
        ) : (
          <>
            {conflicts.map((c, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 space-y-1 ${
                  c.level === "warning"
                    ? "bg-red-500/8 border border-red-500/15"
                    : "bg-amber-500/8 border border-amber-500/15"
                }`}
              >
                <p
                  className={`text-xs font-bold ${c.level === "warning" ? "text-red-400" : "text-amber-400"}`}
                >
                  {c.level === "warning" ? "⚠️ Warning:" : "⚡ Caution:"}{" "}
                  <span className="font-semibold">{c.title}</span>
                </p>
                <p className="text-white/50 text-xs font-satoshi leading-relaxed">
                  {c.detail}
                </p>
              </div>
            ))}
            <button className="w-full text-center text-[11px] font-bold tracking-widest uppercase text-white/25 hover:text-white/50 pt-1 transition-colors">
              View Interaction Guide →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
