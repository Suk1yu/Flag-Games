-- Delete duplicate names, keeping only the entry with the highest score
DELETE FROM public.leaderboard
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.leaderboard
  ORDER BY name, score DESC, created_at ASC
);

-- Add unique constraint to name field
ALTER TABLE public.leaderboard ADD CONSTRAINT unique_player_name UNIQUE (name);
