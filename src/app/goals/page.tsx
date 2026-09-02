"use client";

import { useGoals } from "@/hooks/useGoals";
import { Plus, Target, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function GoalsPage() {
  const { goals, loading, deleteGoal } = useGoals();

  if (loading) return <div className="text-center mt-10">กำลังโหลด...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการเป้าหมาย</h1>
        <Link 
          href="/goals/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> สร้างเป้าหมาย
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isHabit = goal.type === "habit";
          const total = goal.tasks?.length || 0;
          const completed = goal.tasks?.filter((t) => t.isDone).length || 0;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <Card key={goal.id} className="relative overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-gray-50 p-2 rounded-xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{goal.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${isHabit ? 'bg-lime-100 text-lime-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isHabit ? 'กิจวัตรประจำวัน' : 'เป้าหมายระยะยาว'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("ต้องการลบเป้าหมายนี้ใช่หรือไม่?")) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{goal.description}</p>
                
                {!isHabit && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>ความคืบหน้า</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {goals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">คุณยังไม่มีเป้าหมายเลย</p>
          <Link href="/goals/new" className="text-emerald-600 font-medium hover:underline mt-2 inline-block">เริ่มต้นสร้างเป้าหมายแรกกันเลย</Link>
        </div>
      )}
    </div>
  );
}
