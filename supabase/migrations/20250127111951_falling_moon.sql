/*
  # Add constraints and rate limiting for haikus

  1. Changes
    - Add rate limiting for haiku insertions
    - Add constraints for data validation
    - Add indexes for performance

  2. Security
    - Add rate limiting function
    - Add trigger for rate limiting
    - Add check constraints for data validation

  3. Performance
    - Add index on date column for faster lookups
    - Add index on user_id for faster user-specific queries
*/

-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_haiku_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if more than 5 haikus were created in the last hour for the same IP
  IF EXISTS (
    SELECT 1
    FROM haikus
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) >= 5
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many haikus created recently';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limiting
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'haiku_rate_limit_trigger'
  ) THEN
    CREATE TRIGGER haiku_rate_limit_trigger
      BEFORE INSERT ON haikus
      FOR EACH ROW
      EXECUTE FUNCTION check_haiku_rate_limit();
  END IF;
END $$;

-- Add constraints for data validation
DO $$ 
BEGIN
  -- Add check constraint for lines array length
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'haikus_lines_length_check'
  ) THEN
    ALTER TABLE haikus
    ADD CONSTRAINT haikus_lines_length_check
    CHECK (array_length(lines, 1) = 3);
  END IF;

  -- Add check constraint for non-empty source fields
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'haikus_source_not_empty_check'
  ) THEN
    ALTER TABLE haikus
    ADD CONSTRAINT haikus_source_not_empty_check
    CHECK (
      source_headline IS NOT NULL 
      AND source_headline != '' 
      AND source_url IS NOT NULL 
      AND source_url != ''
    );
  END IF;

  -- Add check constraint for valid date
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'haikus_date_check'
  ) THEN
    ALTER TABLE haikus
    ADD CONSTRAINT haikus_date_check
    CHECK (date <= CURRENT_DATE);
  END IF;
END $$;

-- Add indexes for performance
DO $$ 
BEGIN
  -- Add index on date for faster lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'haikus_date_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS haikus_date_idx ON haikus (date);
  END IF;

  -- Add index on user_id for faster user-specific queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'haikus_user_id_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS haikus_user_id_idx ON haikus (user_id);
  END IF;

  -- Add index on created_at for rate limiting queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'haikus_created_at_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS haikus_created_at_idx ON haikus (created_at);
  END IF;
END $$;