-- Create an enum for membership tiers
CREATE TYPE membership_tier AS ENUM ('free', 'paid');

-- Create an enum for organism domains
CREATE TYPE organism_domain AS ENUM ('plants', 'algae', 'fungi', 'microbes', 'animals', 'earth');

-- Create a table for public profiles extending auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  tier membership_tier NOT NULL DEFAULT 'free',
  domain organism_domain NOT NULL,
  
  -- Organism Specific Data
  organism_name TEXT,
  species TEXT,
  habitat TEXT,
  role TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow the system/triggers to insert profiles
CREATE POLICY "System can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, domain)
  VALUES (
    new.id, 
    new.email, 
    -- We assume the user metadata will pass the domain they selected during signup
    COALESCE((new.raw_user_meta_data->>'domain')::organism_domain, 'fungi'::organism_domain)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function after a user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
