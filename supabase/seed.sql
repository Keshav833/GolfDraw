ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active charities" ON charities;

CREATE POLICY "public read active charities"
  ON charities FOR SELECT
  USING (is_active = true);

INSERT INTO charities
  (id, name, description, category, country, website, is_active)
VALUES
  (
    gen_random_uuid(),
    'St Andrews Links Trust',
    'Preserving the historic home of golf and growing the game for future generations across Scotland.',
    'Golf & Sport',
    'Scotland',
    'https://www.standrews.com',
    true
  ),
  (
    gen_random_uuid(),
    'Golf Foundation',
    'Helping young people aged 5-18 discover golf and build confidence through sport.',
    'Golf & Sport',
    'UK',
    'https://www.golf-foundation.org',
    true
  ),
  (
    gen_random_uuid(),
    'The R&A Foundation',
    'Supporting golf development, sustainability and inclusion programmes worldwide.',
    'Golf & Sport',
    'Scotland',
    'https://www.randa.org',
    true
  ),
  (
    gen_random_uuid(),
    'Alzheimer''s Research UK',
    'The UK''s leading dementia research charity, funding pioneering work to defeat dementia.',
    'Health & Research',
    'UK',
    'https://www.alzheimersresearchuk.org',
    true
  ),
  (
    gen_random_uuid(),
    'British Heart Foundation',
    'Funding research that has already saved millions of lives and continues to fight heart disease.',
    'Health & Research',
    'UK',
    'https://www.bhf.org.uk',
    true
  ),
  (
    gen_random_uuid(),
    'Macmillan Cancer Support',
    'Providing medical, emotional and financial support to people living with cancer.',
    'Health & Research',
    'UK',
    'https://www.macmillan.org.uk',
    true
  ),
  (
    gen_random_uuid(),
    'Youth Sport Trust',
    'Helping young people build healthy, active lives through the power of sport and physical activity.',
    'Youth & Education',
    'UK',
    'https://www.youthsporttrust.org',
    true
  ),
  (
    gen_random_uuid(),
    'Street League',
    'Using football and sport to support young people into employment, education and training.',
    'Youth & Education',
    'UK',
    'https://www.streetleague.co.uk',
    true
  ),
  (
    gen_random_uuid(),
    'StreetGames',
    'Bringing sport to young people in the UK''s most disadvantaged communities.',
    'Youth & Education',
    'UK',
    'https://www.streetgames.org',
    true
  ),
  (
    gen_random_uuid(),
    'The Wildlife Trusts',
    'A grassroots movement of people who care about nature, protecting wildlife across the UK.',
    'Environment',
    'UK',
    'https://www.wildlifetrusts.org',
    true
  ),
  (
    gen_random_uuid(),
    'Woodland Trust',
    'The UK''s largest woodland conservation charity, protecting and restoring ancient woodland.',
    'Environment',
    'UK',
    'https://www.woodlandtrust.org.uk',
    true
  ),
  (
    gen_random_uuid(),
    'Golf Environment Organisation',
    'Working with golf courses to protect and enhance the natural environment of golf.',
    'Environment',
    'Scotland',
    'https://www.geo-foundation.org',
    true
  );
