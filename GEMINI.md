# Goal & To-Do Life Tracker Web App

## Architecture
- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS, shadcn/ui, Recharts
- **Database & Auth**: Firebase (Client SDK)
- **AI**: Gemini 1.5 Flash via Next.js API Routes (`/api/chat`)

## Setup Instructions
1. สร้าง Firebase Project และเปิดใช้ Authentication (Google)
2. สร้าง Cloud Firestore
3. สร้าง Gemini API Key ที่ Google AI Studio
4. ใส่ค่าทั้งหมดลงในไฟล์ `.env.local`

## Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`
