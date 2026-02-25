import { useMemo, useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { habits } = useHabits();
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month, days, monthLabel, activityMap } = useMemo(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const firstDay = target.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = target.toLocaleDateString("en", { month: "long", year: "numeric" });

    // Build activity map for the month
    const activityMap: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      activityMap[dateStr] = habits.filter((h) => h.logs.includes(dateStr)).length;
    }

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return { year, month, days, monthLabel, activityMap };
  }, [habits, monthOffset]);

  const maxActivity = Math.max(1, habits.length);
  const todayStr = new Date().toISOString().split("T")[0];

  function getIntensity(count: number): string {
    if (count === 0) return "bg-muted";
    const ratio = count / maxActivity;
    if (ratio >= 0.75) return "bg-gradient-to-br from-[hsl(250,80%,55%)] to-[hsl(195,90%,50%)]";
    if (ratio >= 0.5) return "bg-[hsl(220,90%,56%)]";
    if (ratio >= 0.25) return "bg-[hsl(250,60%,70%)]";
    return "bg-[hsl(250,40%,80%)] dark:bg-[hsl(250,40%,35%)]";
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">Visualize your habit consistency</p>
      </div>

      <div className="glass-card rounded-xl p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setMonthOffset((o) => o - 1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-semibold">{monthLabel}</h3>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            disabled={monthOffset >= 0}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const count = activityMap[dateStr] || 0;
            const isToday = dateStr === todayStr;
            return (
              <div
                key={i}
                className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 ${getIntensity(count)} ${
                  count > 0 ? "text-primary-foreground" : "text-muted-foreground"
                } ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                title={`${dateStr}: ${count}/${habits.length} habits`}
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-[hsl(250,40%,80%)] dark:bg-[hsl(250,40%,35%)]" />
          <div className="h-3 w-3 rounded-sm bg-[hsl(250,60%,70%)]" />
          <div className="h-3 w-3 rounded-sm bg-[hsl(220,90%,56%)]" />
          <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-[hsl(250,80%,55%)] to-[hsl(195,90%,50%)]" />
          <span>More</span>
        </div>
      </div>

      {/* Contribution summary */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold mb-3">This Month's Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold gradient-text">
              {Object.values(activityMap).filter((v) => v > 0).length}
            </p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold gradient-text">
              {Object.values(activityMap).reduce((s, v) => s + v, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Completions</p>
          </div>
          <div>
            <p className="text-2xl font-bold gradient-text">
              {days.filter((d) => d !== null).length > 0
                ? Math.round(
                    (Object.values(activityMap).filter((v) => v > 0).length /
                      Object.keys(activityMap).length) *
                      100
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
