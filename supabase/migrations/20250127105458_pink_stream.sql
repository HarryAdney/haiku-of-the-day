/*
  # Initial Schema Setup

  1. New Tables
    - `haikus`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `date` (date)
      - `lines` (text array)
      - `source_headline` (text)
      - `source_url` (text)
      - `user_id` (uuid, foreign key)
    
    - `favorites`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)
      - `haiku_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create haikus table
CREATE TABLE haikus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date date NOT NULL,
  lines text[] NOT NULL,
  source_headline text NOT NULL,
  source_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id)
);

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  haiku_id uuid REFERENCES haikus(id) NOT NULL,
  UNIQUE(user_id, haiku_id)
);

-- Enable RLS
ALTER TABLE haikus ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies for haikus
CREATE POLICY "Haikus are viewable by everyone"
  ON haikus
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own haikus"
  ON haikus
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);