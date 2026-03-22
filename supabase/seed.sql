-- Insert seed data for Charities
INSERT INTO public.charities (id, name, description, category, country, is_active) VALUES
  (gen_random_uuid(), 'St Andrews Links Trust', 'Preserving the Home of Golf for future generations.', 'Golf & sport', 'Scotland', true),
  (gen_random_uuid(), 'Alzheimer''s Research UK', 'Leading dementia research charity.', 'Health & research', 'UK', true),
  (gen_random_uuid(), 'Youth Sport Trust', 'Children''s charity working to ensure every child enjoys the life-changing benefits of play.', 'Youth & education', 'UK', true)
ON CONFLICT DO NOTHING;

-- For Auth Users seed, we typically rely on application registration because the hashes are complex
-- But charities are public data we can insert easily.
