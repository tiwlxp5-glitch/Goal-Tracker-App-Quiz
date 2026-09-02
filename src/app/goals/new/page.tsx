"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoals } from "@/hooks/useGoals";
import { Bot, User, ArrowLeft, Loader2, Target, CalendarDays, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function NewGoalPage() {
  const router = useRouter();
  const { addGoal } = useGoals();
  const [mode, setMode] = useState<"choose" | "manual" | "ai">("choose");

  if (mode === "choose") {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
        </button>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">สร้างเป้าหมายใหม่</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
            onClick={() => setMode("ai")}
          >
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">ให้ AI ช่วยวางแผน</h2>
              <p className="text-gray-500 text-sm">ตอบคำถามสั้นๆ แล้วให้ AI แตกเป้าหมายใหญ่เป็นสิ่งที่ทำได้จริงทีละขั้นตอน</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            onClick={() => setMode("manual")}
          >
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">สร้างด้วยตัวเอง</h2>
              <p className="text-gray-500 text-sm">กำหนดรายละเอียดเป้าหมายและขั้นตอนต่างๆ ด้วยตัวคุณเองทั้งหมด</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "manual") {
    return <ManualGoalForm onBack={() => setMode("choose")} />;
  }

  return <AIGoalInterview onBack={() => setMode("choose")} />;
}

function ManualGoalForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { addGoal } = useGoals();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"long-term" | "habit">("long-term");
  const [icon, setIcon] = useState("🎯");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await addGoal({
      title,
      description: desc,
      type,
      icon,
      color: "#10b981",
      createdAt: new Date().toISOString(),
      tasks: [],
      completedDates: []
    });
    router.push("/goals");
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6"><ArrowLeft className="w-4 h-4 mr-1"/> กลับ</button>
      <h2 className="text-2xl font-bold mb-6">สร้างเป้าหมายด้วยตัวเอง</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>ไอคอน</Label>
          <Input value={icon} onChange={e => setIcon(e.target.value)} className="text-2xl w-20 text-center" />
        </div>
        <div>
          <Label>ชื่อเป้าหมาย</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="เช่น อ่านหนังสือ 10 เล่ม, วิ่งมาราธอน" />
        </div>
        <div>
          <Label>คำอธิบาย</Label>
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." />
        </div>
        <div>
          <Label>ประเภท</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="type" checked={type === "long-term"} onChange={() => setType("long-term")} />
              เป้าหมายระยะยาว
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" checked={type === "habit"} onChange={() => setType("habit")} />
              กิจวัตรประจำวัน
            </label>
          </div>
        </div>
        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-6">บันทึกเป้าหมาย</Button>
      </form>
    </div>
  );
}

// AI Interview Component
type Message = { role: "user" | "model"; content: string };

function AIGoalInterview({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { addGoal } = useGoals();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "สวัสดีครับ! ผมคือ AI โค้ชที่จะช่วยคุณวางแผนเป้าหมาย วันนี้คุณอยากตั้งเป้าหมายอะไรครับ? (เช่น อยากเก็บเงิน 1 แสน, อยากลดน้ำหนัก 5 กิโล)" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newMsgs: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      
      if (data.isReadyToGenerate) {
        setIsDone(true);
        setGeneratedData(data.goalPlan);
      } else {
        setMessages([...newMsgs, { role: "model", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!generatedData) return;
    await addGoal({
      title: generatedData.title || "เป้าหมายใหม่",
      description: generatedData.description || "สร้างโดย AI",
      type: "long-term", // AI breaks down tasks, so it's long-term
      icon: generatedData.icon || "🌟",
      color: "#10b981",
      createdAt: new Date().toISOString(),
      tasks: generatedData.tasks?.map((t: any) => ({
        id: crypto.randomUUID(),
        title: t.title,
        isDone: false,
        suggestedDate: t.suggested_date
      })) || [],
      completedDates: []
    });
    router.push("/goals");
  };

  if (isDone && generatedData) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2"><Sparkles className="text-yellow-500"/> AI แผนการเป้าหมายของคุณ</h2>
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{generatedData.icon} {generatedData.title}</h3>
            <p className="text-gray-600 mb-6">{generatedData.description}</p>
            <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">ขั้นตอนที่ AI แนะนำ</h4>
            <div className="space-y-3">
              {generatedData.tasks?.map((t: any, i: number) => (
                <div key={i} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border">
                  <div className="bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">{i+1}</div>
                  <div>
                    <p className="font-medium text-gray-800">{t.title}</p>
                    {t.suggested_date && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {t.suggested_date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsDone(false)} className="flex-1">คุยปรับแผนใหม่</Button>
          <Button onClick={handleSaveGoal} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">บันทึกเป้าหมายนี้</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 h-full flex flex-col">
      <div className="flex items-center mb-6 border-b pb-4">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> 
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">โค้ช AI</h2>
          <p className="text-xs text-emerald-600 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>ออนไลน์</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.role === "user" 
                ? "bg-emerald-600 text-white rounded-br-none" 
                : "bg-white border text-gray-800 rounded-bl-none shadow-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border text-gray-500 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> โค้ชกำลังคิด...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="ตอบโค้ชตรงนี้..." 
          disabled={loading}
          className="rounded-xl border-gray-300"
        />
        <Button type="submit" disabled={loading} className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 px-6">
          ส่ง
        </Button>
      </form>
    </div>
  );
}
