"use client";

import { useGoals } from "@/hooks/useGoals";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award, CalendarDays } from "lucide-react";

export default function StatsPage() {
  const { goals, loading } = useGoals();

  if (loading) return <div className="text-center mt-10">กำลังโหลด...</div>;

  const habits = goals.filter((g) => g.type === "habit");
  
  // Calculate max streak globally across all habits
  let maxStreak = 0;
  let totalHabitsDone = 0;

  habits.forEach(habit => {
    totalHabitsDone += (habit.completedDates?.length || 0);
    
    // Naive max streak calculation for simplicity
    let currentStreak = 0;
    const sortedDates = [...(habit.completedDates || [])].sort().reverse();
    
    if (sortedDates.length > 0) {
        let tempStreak = 1;
        let bestStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const d1 = new Date(sortedDates[i]).getTime();
            const d2 = new Date(sortedDates[i+1]).getTime();
            const diffDays = (d1 - d2) / (1000 * 3600 * 24);
            if (diffDays === 1) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, bestStreak);
    }
  });

  // Last 30 days calendar view data
  const endDate = new Date();
  const startDate = subDays(endDate, 29);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">สถิติและความสำเร็จ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-orange-600 font-medium">Streak สูงสุดที่เคยทำได้</p>
              <h3 className="text-3xl font-bold text-orange-700">{maxStreak} วันรวด</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Award className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-blue-600 font-medium">จำนวนครั้งที่ทำกิจวัตรสำเร็จ</p>
              <h3 className="text-3xl font-bold text-blue-700">{totalHabitsDone} ครั้ง</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
            <CalendarDays className="w-5 h-5 text-emerald-500"/> ความสม่ำเสมอ 30 วันที่ผ่านมา
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-gray-500 text-sm">ยังไม่มีข้อมูลกิจวัตร</p>
          ) : (
            <div className="space-y-6">
              {habits.map(habit => (
                <div key={habit.id}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{habit.icon} {habit.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {days.map(day => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const isDone = habit.completedDates?.includes(dateStr);
                      return (
                        <div 
                          key={dateStr}
                          title={dateStr}
                          className={`w-5 h-5 rounded-sm ${isDone ? 'bg-emerald-500' : 'bg-gray-100'} transition-colors`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
