-- Users table (extends default auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table (Created by teachers)
CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (Belongs to an exam)
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  section TEXT CHECK (section IN ('listening', 'reading', 'writing', 'speaking')),
  question_type TEXT,
  content JSONB,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table (Student submissions and grades)
CREATE TABLE public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB, -- student's raw answers
  score_listening NUMERIC(3,1),
  score_reading NUMERIC(3,1),
  score_writing NUMERIC(3,1),
  score_speaking NUMERIC(3,1),
  overall_band NUMERIC(3,1),
  teacher_feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'graded')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  criteria_writing JSONB,        -- {"ta": 7.0, "cc": 8.0, "lr": 7.5, "gra": 7.5}
  criteria_speaking JSONB,       -- {"fc": 7.0, "lr": 8.0, "gra": 7.5, "pr": 7.5}
  voice_feedback_url TEXT,       -- Ovozli feedback URL (Supabase Storage)
  draft_feedback TEXT             -- Qoralama matni
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create basic policies (For development purposes, we can allow read/write for authenticated users)
CREATE POLICY "Allow full access to authenticated users" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON public.exams FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON public.questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON public.results FOR ALL TO authenticated USING (true);

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================
-- STORAGE CONFIGURATION (For Exam Assets)
-- ==============================================

-- Create a new public bucket for exam files (audios, images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exam-assets', 'exam-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to everyone
CREATE POLICY "Public Read Access for Exam Assets" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'exam-assets');

-- Allow authenticated users (teachers) to upload files
CREATE POLICY "Authenticated users can upload exam assets" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'exam-assets'
  );
