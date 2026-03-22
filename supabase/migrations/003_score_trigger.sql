-- Postgres trigger: rolling 5-score window
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

CREATE TRIGGER score_limit_trigger
AFTER INSERT ON scores
FOR EACH ROW EXECUTE FUNCTION enforce_score_limit();
