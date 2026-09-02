# Universal AI Context: Goal & To-Do Life Tracker

## Project Overview
- **Project Name**: Goal & To-Do Life Tracker
- **Tech Stack**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Recharts
- **Database & Auth**: Firebase Authentication (Google Sign-in) & Cloud Firestore
- **AI Integration**: Gemini 1.5 Flash via Next.js API Routes (`/api/chat`)
- **Current Status**: Project is fully set up and functional. Basic pages (Dashboard, Check-in, Goals Management, AI Interview, Stats) are implemented.
- **Theme**: Mint/Nature (เขียว-เหลืองพาสเทล)

## Critical Files & Architecture
- `src/lib/firebase.ts`: Firebase client initialization.
- `src/context/AuthContext.tsx`: Global auth state.
- `src/hooks/useGoals.ts`: Custom hook for Firestore CRUD operations.
- `src/app/api/chat/route.ts`: Gemini API endpoint for the AI coach.
- `.env.local`: Contains Firebase and Gemini API keys.

## Known Issues / Recent Fixes
- Fixed a typo in the Firebase API Key inside `.env.local` which caused an `auth/invalid-api-key` error on login.
- Next.js development server is currently running.

## Current Goal
The user has completed the manual setup phase for Firebase and Gemini API. We are transitioning to a new chat session to refresh context. The AI should assist the user in adding new features, testing, or deploying the app to Vercel.
