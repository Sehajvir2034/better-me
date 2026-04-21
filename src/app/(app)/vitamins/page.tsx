import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  getSupplements,
  getSupplementLogs,
  getAdherence,
  getWeekSummary,
} from "@/lib/vitamin";
import { SupplementHero } from "@/components/vitamin/supplement-hero";
import { SupplementChecklist } from "@/components/vitamin/supplement-checklist";
import { SupplementStackGrid } from "@/components/vitamin/supplement-stack-grid";
import { SupplementWeekStrip } from "@/components/vitamin/supplement-week-strip";
import { SupplementAdherence } from "@/components/vitamin/supplement-adherence";

export default async function VitaminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const today = format(new Date(), "yyyy-MM-dd");

  const [supplements, logs, adherenceData, weekData] = await Promise.all([
    getSupplements(userId),
    getSupplementLogs(userId, today),
    getAdherence(userId),
    getWeekSummary(userId),
  ]);

  const takenToday = logs.filter((l) => l.log.status === "taken").length;

  // Overall streak — days where all supplements were taken
  const streak = weekData.filter(
    (d) => d.total > 0 && d.taken === d.total,
  ).length;

  return (
    <div className="font-satoshi min-h-screen px-4 pb-10 text-[#FFFFE4] space-y-4 max-w-lg mx-auto">
      <div className="pt-6 pb-2 flex items-end justify-between">
        <div>
          <p className="text-white/40 text-sm uppercase tracking-widest">
            Today
          </p>
          <h1 className="text-[#FFFFE4] font-bold text-3xl">Vitamins</h1>
        </div>
      </div>

      <SupplementHero
        total={supplements.length}
        taken={takenToday}
        streak={streak}
        date={today}
      />

      <SupplementChecklist
        userId={userId}
        supplements={supplements}
        logs={logs}
        date={today}
      />

      <SupplementStackGrid userId={userId} adherenceData={adherenceData} />

      <SupplementWeekStrip weekData={weekData} />

      <SupplementAdherence data={adherenceData} />
    </div>
  );
}
