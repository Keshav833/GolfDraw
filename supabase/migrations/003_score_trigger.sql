CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM scores
      WHERE user_id = NEW.user_id
      ORDER BY submitted_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS score_limit_trigger ON scores;

CREATE OR REPLACE TRIGGER score_limit_trigger
  AFTER INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION enforce_score_limit();

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users select own scores" ON scores;
DROP POLICY IF EXISTS "users insert own scores" ON scores;

CREATE POLICY "users select own scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
