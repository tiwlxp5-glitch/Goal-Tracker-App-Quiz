"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, Target, CheckSquare, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Check-in", href: "/check-in", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Stats", href: "/stats", icon: BarChart2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, loginWithPassword, registerWithPassword } = useAuth();
  const pathname = usePathname();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน", type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    let error;
    if (isRegister) {
      const res = await registerWithPassword(email, password);
      error = res.error;
    } else {
      const res = await loginWithPassword(email, password);
      error = res.error;
    }
    
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: isRegister ? "สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบสำเร็จ!", type: 'success' });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-green-50">กำลังโหลด...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-2">Life Tracker</h1>
          <p className="text-gray-500 mb-6">{isRegister ? "สมัครสมาชิกใหม่" : "เข้าสู่ระบบเพื่อติดตามเป้าหมาย"}</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={6}
              />
            </div>
            
            {message && (
              <div className={`p-3 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "กำลังดำเนินการ..." : (isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ")}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage(null);
              }}
              className="text-sm text-green-600 hover:underline"
            >
              {isRegister ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่" : "ยังไม่มีบัญชี? สมัครสมาชิกใหม่"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get display name or email prefix
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=10b981&color=fff`;

  return (
    <div className="flex h-screen bg-green-50/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-green-100">
        <div className="p-6">
          <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <Target className="w-6 h-6" /> Life Tracker
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-green-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-green-100 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-700 flex items-center gap-2">
            <Target className="w-5 h-5" /> Tracker
          </h1>
          <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full" onClick={logout} />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? "fill-green-100" : ""}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
