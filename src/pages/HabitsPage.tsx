import { useState, useMemo } from "react";
import { useHabits, todayStr, getStreak } from "@/hooks/useHabits";
import { CATEGORIES, CATEGORY_COLORS, type HabitCategory } from "@/types/habit";
import type { Habit } from "@/types/habit";
import { Plus, Search, Pencil, Trash2, CheckCircle2, Flame, X, Download, AlertTriangle } from "lucide-react";

function HabitForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Habit>;
  onSubmit: (data: { name: string; category: HabitCategory; description: string; notes: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState<HabitCategory>(initial?.category || "Health");
  const [description, setDescription] = useState(initial?.description || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  return (
    <div className="glass-card rounded-xl p-5 space-y-4 animate-in-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? "Edit Habit" : "New Habit"}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        placeholder="Habit name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as HabitCategory)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <button
        disabled={!name.trim()}
        onClick={() => name.trim() && onSubmit({ name: name.trim(), category, description, notes })}
        className="w-full gradient-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {initial ? "Save Changes" : "Add Habit"}
      </button>
    </div>
  );
}

export default function HabitsPage() {
  const { habits, addHabit, editHabit, deleteHabit, toggleToday, resetAll, exportData } = useHabits();
  const today = todayStr();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<HabitCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"name" | "streak" | "rate">("name");
  const [confirmReset, setConfirmReset] = useState(false);

  const filtered = useMemo(() => {
    let list = habits.filter(
      (h) =>
        (filterCat === "All" || h.category === filterCat) &&
        h.name.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === "streak") return getStreak(b.logs).current - getStreak(a.logs).current;
      if (sortBy === "rate") {
        const rateA = a.logs.length / Math.max(1, Math.ceil((Date.now() - new Date(a.createdAt).getTime()) / 86400000));
        const rateB = b.logs.length / Math.max(1, Math.ceil((Date.now() - new Date(b.createdAt).getTime()) / 86400000));
        return rateB - rateA;
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [habits, search, filterCat, sortBy]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground mt-1">Manage and track your daily habits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportData} className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
            <AlertTriangle className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-1.5 gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Habit
          </button>
        </div>
      </div>

      {/* Reset confirm */}
      {confirmReset && (
        <div className="glass-card rounded-xl p-4 border-destructive/30 flex items-center justify-between flex-wrap gap-3 animate-in-up">
          <p className="text-sm font-medium text-destructive">Are you sure? This will delete all habits permanently.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button onClick={() => { resetAll(); setConfirmReset(false); }} className="px-3 py-1.5 text-xs rounded-lg bg-destructive text-destructive-foreground hover:opacity-90">Delete All</button>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <HabitForm
          initial={editingId ? habits.find((h) => h.id === editingId) : undefined}
          onSubmit={(data) => {
            if (editingId) editHabit(editingId, data);
            else addHabit(data);
            setShowForm(false);
            setEditingId(null);
          }}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as HabitCategory | "All")}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="name">Sort: Name</option>
          <option value="streak">Sort: Streak</option>
          <option value="rate">Sort: Completion</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          {habits.length === 0 ? "No habits yet. Click 'Add Habit' to get started!" : "No habits match your filters."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((habit) => {
            const done = habit.logs.includes(today);
            const streak = getStreak(habit.logs);
            const catGradient = CATEGORY_COLORS[habit.category];
            return (
              <div key={habit.id} className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${done ? "ring-2 ring-success/40" : ""}`}>
                <div className={`h-1 bg-gradient-to-r ${catGradient}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${done ? "line-through opacity-60" : ""}`}>{habit.name}</p>
                      {habit.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{habit.description}</p>}
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{habit.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(habit.id); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteHabit(habit.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {streak.current > 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium text-warning">
                        <Flame className="h-3.5 w-3.5" /> {streak.current}d streak
                      </div>
                    )}
                    {streak.current === 0 && <div />}
                    <button
                      onClick={() => toggleToday(habit.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                        done
                          ? "bg-success/15 text-success"
                          : "gradient-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {done ? "Done" : "Complete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
