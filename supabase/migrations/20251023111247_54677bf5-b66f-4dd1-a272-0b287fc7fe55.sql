-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Player',
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read leaderboard
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- Create policy to allow anyone to insert their score
CREATE POLICY "Anyone can insert score"
ON public.leaderboard
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries on score
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);

-- Create index for faster queries on created_at
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard(created_at DESC);
