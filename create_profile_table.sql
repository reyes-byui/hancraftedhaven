-- Create the profile table to store user information
-- This table will store both customer and seller profiles

CREATE TABLE IF NOT EXISTS public.profile (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('seller', 'customer')),
  first_name text,
  last_name text,
  photo_url text,
  country text,
  address text,
  contact_number text,
  username text,
  -- Seller specific fields
  business_name text, -- For sellers only
  business_address text, -- For sellers only
  business_description text, -- For seller business description
  -- System fields
  profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Allow users to insert their own profile" ON public.profile
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to select their own profile" ON public.profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profile
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to delete their own profile" ON public.profile
  FOR DELETE USING (auth.uid() = id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profile_role_idx ON public.profile(role);
CREATE INDEX IF NOT EXISTS profile_username_idx ON public.profile(username);
CREATE INDEX IF NOT EXISTS profile_completed_idx ON public.profile(profile_completed);
