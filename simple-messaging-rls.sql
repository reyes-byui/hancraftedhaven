-- Basic RLS setup for messaging system
-- Run this in Supabase SQL Editor

-- Enable RLS on tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users conversations access" ON public.conversations;
DROP POLICY IF EXISTS "Allow all authenticated users messages access" ON public.messages;

-- Create permissive policies for testing (can be tightened later)
CREATE POLICY "Allow all authenticated users conversations access" ON public.conversations
    FOR ALL 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users messages access" ON public.messages
    FOR ALL 
    USING (auth.uid() IS NOT NULL);
