"use client";

import { useGoals } from "@/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export default function DashboardPage() {
  const { goals, loading } = useGoals();

  if (loading) {
    return <div className="flex justify-center items-center h-full">กำลังโหลดข้อมูล...</div>;
  }

  const longTermGoals = goals.filter((g) => g.type === "long-term");
  const habits = goals.filter((g) => g.type === "habit");

  // Calculate Progress for Long-term Goals
  const pieData = longTermGoals.map((g) => {
    const total = g.tasks?.length || 0;
    const completed = g.tasks?.filter((t) => t.isDone).length || 0;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { name: g.title, value: progress, remaining: 100 - progress };
  });

  // Calculate Streak for Habits (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
  
  const barData = habits.map((h) => {
    const doneCount = last7Days.filter(date => h.completedDates?.includes(date)).length;
    return { name: h.title, count: doneCount };
  });

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ยินดีต้อนรับกลับมา!</h1>
        <p className="text-gray-500">นี่คือภาพรวมเป้าหมายของคุณในวันนี้</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full"><Target className="w-8 h-8" /></div>
              <div>
                <p className="text-green-100 text-sm font-medium">เป้าหมายทั้งหมด</p>
                <h3 className="text-3xl font-bold">{goals.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full"><CheckCircle2 className="w-8 h-8" /></div>
              <div>
                <p className="text-teal-100 text-sm font-medium">ความคืบหน้าโดยรวม</p>
                <h3 className="text-3xl font-bold">
                  {pieData.length > 0 
                    ? Math.round(pieData.reduce((acc, curr) => acc + curr.value, 0) / pieData.length) 
                    : 0}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-lime-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full"><Calendar className="w-8 h-8" /></div>
              <div>
                <p className="text-lime-100 text-sm font-medium">กิจวัตรที่มี</p>
                <h3 className="text-3xl font-bold">{habits.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Long term goals progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500"/> ความคืบหน้าเป้าหมายระยะยาว
            </CardTitle>
          </CardHeader>
          <CardContent>
            {longTermGoals.length === 0 ? (
              <p className="text-gray-400 text-sm">ยังไม่มีเป้าหมายระยะยาว</p>
            ) : (
              <div className="space-y-4">
                {longTermGoals.map(g => {
                  const total = g.tasks?.length || 0;
                  const completed = g.tasks?.filter((t) => t.isDone).length || 0;
                  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{g.title}</span>
                        <span className="text-gray-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-100" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habit Streaks Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500"/> ความสม่ำเสมอใน 7 วันหลัง
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {habits.length === 0 ? (
               <p className="text-gray-400 text-sm">ยังไม่มีกิจวัตร</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 7]} />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="จำนวนวันทำสำเร็จ" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
