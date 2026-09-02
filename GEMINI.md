# Goal & To-Do Life Tracker Web App

## Production
- **Live URL**: https://goal-tracker-app-quiz.vercel.app
- **GitHub Repository**: https://github.com/tiwlxp5-glitch/Goal-Tracker-App-Quiz

## Architecture
- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS, shadcn/ui, Recharts
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **AI**: Gemini 1.5 Flash via Next.js API Routes (`/api/chat`)

## Setup Instructions
1. สร้าง Supabase Project
2. นำ SQL Schema จาก `supabase_schema.sql` ไปรันใน SQL Editor ของ Supabase
3. สร้าง Gemini API Key ที่ Google AI Studio
4. ใส่ค่าทั้งหมดลงในไฟล์ `.env.local`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
