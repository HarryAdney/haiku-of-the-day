/*
  # Update haikus table policies

  1. Changes
    - Allow anonymous users to insert haikus
    - Make user_id optional for haikus table
    - Update RLS policies to handle anonymous inserts

  2. Security
    - Maintain read access for everyone
    - Allow both authenticated and anonymous users to insert haikus
*/

-- Make user_id optional
ALTER TABLE haikus ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert their own haikus" ON haikus;

-- Create new insert policy that allows anonymous inserts
CREATE POLICY "Anyone can insert haikus"
  ON haikus
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Keep existing select policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'haikus' 
    AND policyname = 'Haikus are viewable by everyone'
  ) THEN
    CREATE POLICY "Haikus are viewable by everyone"
      ON haikus
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;