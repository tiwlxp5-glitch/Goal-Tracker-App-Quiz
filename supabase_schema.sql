-- 1. Create goals table
CREATE TABLE public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('long-term', 'habit')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  target_date timestamp with time zone,
  color text DEFAULT '#10b981',
  icon text DEFAULT 'Target',
  tasks jsonb DEFAULT '[]'::jsonb,
  completed_dates jsonb DEFAULT '[]'::jsonb
);

-- 2. Set up Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- 3. Create policies so users can only access their own data
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);
