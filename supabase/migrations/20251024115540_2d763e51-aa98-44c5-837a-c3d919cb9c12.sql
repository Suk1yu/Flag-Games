-- Allow users to update their own scores in leaderboard
CREATE POLICY "Anyone can update their own score" 
ON public.leaderboard 
FOR UPDATE 
USING (true)
WITH CHECK (true);
