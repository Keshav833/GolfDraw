INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'winner-proofs',
  'winner-proofs',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "winners upload own proof"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "winners read own proof"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'winner-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "winners see own verifications"
  ON winner_verifications FOR SELECT
  USING (
    draw_result_id IN (
      SELECT id FROM draw_results
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "winners insert own verification"
  ON winner_verifications FOR INSERT
  WITH CHECK (
    draw_result_id IN (
      SELECT id FROM draw_results
      WHERE user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.review_winner_verification(
  p_verification_id uuid,
  p_action text,
  p_rejection_note text,
  p_reviewed_by uuid
)
RETURNS TABLE (
  verification_id uuid,
  verification_status text,
  draw_result_id uuid,
  draw_result_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_draw_result_id uuid;
BEGIN
  SELECT draw_result_id
    INTO v_draw_result_id
    FROM winner_verifications
   WHERE id = p_verification_id
   FOR UPDATE;

  IF v_draw_result_id IS NULL THEN
    RAISE EXCEPTION 'Verification not found';
  END IF;

  IF p_action = 'approve' THEN
    UPDATE winner_verifications
       SET status = 'approved',
           rejection_note = NULL,
           reviewed_by = p_reviewed_by,
           reviewed_at = now()
     WHERE id = p_verification_id
       AND status = 'pending';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Verification is not pending';
    END IF;

    UPDATE draw_results
       SET payment_status = 'approved'
     WHERE id = v_draw_result_id;

    RETURN QUERY
    SELECT wv.id, wv.status, dr.id, dr.payment_status
      FROM winner_verifications wv
      JOIN draw_results dr ON dr.id = wv.draw_result_id
     WHERE wv.id = p_verification_id;
  ELSIF p_action = 'reject' THEN
    UPDATE winner_verifications
       SET status = 'rejected',
           rejection_note = p_rejection_note,
           reviewed_by = p_reviewed_by,
           reviewed_at = now()
     WHERE id = p_verification_id
       AND status = 'pending';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Verification is not pending';
    END IF;

    UPDATE draw_results
       SET payment_status = 'rejected'
     WHERE id = v_draw_result_id;

    RETURN QUERY
    SELECT wv.id, wv.status, dr.id, dr.payment_status
      FROM winner_verifications wv
      JOIN draw_results dr ON dr.id = wv.draw_result_id
     WHERE wv.id = p_verification_id;
  ELSIF p_action = 're_review' THEN
    UPDATE winner_verifications
       SET status = 'pending',
           rejection_note = NULL,
           reviewed_by = NULL,
           reviewed_at = NULL
     WHERE id = p_verification_id
       AND status = 'rejected';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Only rejected verifications can be reset';
    END IF;

    UPDATE draw_results
       SET payment_status = 'pending'
     WHERE id = v_draw_result_id;

    RETURN QUERY
    SELECT wv.id, wv.status, dr.id, dr.payment_status
      FROM winner_verifications wv
      JOIN draw_results dr ON dr.id = wv.draw_result_id
     WHERE wv.id = p_verification_id;
  ELSE
    RAISE EXCEPTION 'Unsupported review action';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_winner_verification_paid(
  p_verification_id uuid
)
RETURNS TABLE (
  verification_id uuid,
  verification_status text,
  draw_result_id uuid,
  draw_result_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_draw_result_id uuid;
  v_status text;
BEGIN
  SELECT draw_result_id, status
    INTO v_draw_result_id, v_status
    FROM winner_verifications
   WHERE id = p_verification_id
   FOR UPDATE;

  IF v_draw_result_id IS NULL THEN
    RAISE EXCEPTION 'Verification not found';
  END IF;

  IF v_status <> 'approved' THEN
    RAISE EXCEPTION 'Verification must be approved before marking paid';
  END IF;

  UPDATE draw_results
     SET payment_status = 'paid'
   WHERE id = v_draw_result_id
     AND payment_status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draw result is not approved';
  END IF;

  RETURN QUERY
  SELECT wv.id, wv.status, dr.id, dr.payment_status
    FROM winner_verifications wv
    JOIN draw_results dr ON dr.id = wv.draw_result_id
   WHERE wv.id = p_verification_id;
END;
$$;
