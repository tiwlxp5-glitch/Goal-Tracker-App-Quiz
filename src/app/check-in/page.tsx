"use client";

import { useGoals } from "@/hooks/useGoals";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckInPage() {
  const { goals, loading, toggleTask, toggleHabitDate } = useGoals();

  if (loading) return <div className="flex justify-center mt-10">กำลังโหลด...</div>;

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#fcd34d"]
    });
  };

  const handleTaskCheck = async (goalId: string, taskId: string, isDone: boolean) => {
    await toggleTask(goalId, taskId, isDone);
    if (isDone) fireConfetti();
  };

  const handleHabitCheck = async (goalId: string, isDone: boolean) => {
    await toggleHabitDate(goalId, todayStr);
    if (isDone) fireConfetti();
  };

  const habits = goals.filter((g) => g.type === "habit");
  const longTermGoals = goals.filter((g) => g.type === "long-term");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ภารกิจประจำวัน</h1>
        <p className="text-gray-500">{format(new Date(), "dd MMMM yyyy")}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">กิจวัตร (Habits)</h2>
        <div className="space-y-3">
          {habits.length === 0 ? <p className="text-sm text-gray-500">ไม่มีกิจวัตรที่ต้องทำ</p> : null}
          {habits.map((habit) => {
            const isDone = habit.completedDates?.includes(todayStr) || false;
            return (
              <Card key={habit.id} className={`transition-colors ${isDone ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <span className={`font-medium ${isDone ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                      {habit.title}
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    className="w-6 h-6 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={isDone}
                    onChange={(e) => handleHabitCheck(habit.id, e.target.checked)}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="pt-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">เป้าหมายระยะยาว (Tasks)</h2>
        <div className="space-y-4">
          {longTermGoals.length === 0 ? <p className="text-sm text-gray-500">ไม่มีเป้าหมายระยะยาว</p> : null}
          {longTermGoals.map((goal) => {
            const pendingTasks = goal.tasks?.filter((t) => !t.isDone) || [];
            if (pendingTasks.length === 0) return null;
            return (
              <div key={goal.id} className="bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">{goal.icon}</span> {goal.title}
                </h3>
                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                  {pendingTasks.map((task) => (
                    <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        checked={task.isDone}
                        onChange={(e) => handleTaskCheck(goal.id, task.id, e.target.checked)}
                      />
                      <span className="text-gray-600 group-hover:text-gray-900">{task.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
