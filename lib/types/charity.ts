export type Charity = {
  id: string;
  name: string;
  description: string;
  category:
    | 'Golf & Sport'
    | 'Health & Research'
    | 'Youth & Education'
    | 'Environment';
  country: string;
  website?: string | null;
  is_active: boolean;
  created_at: string;
};

export const CATEGORIES = [
  'Golf & Sport',
  'Health & Research',
  'Youth & Education',
  'Environment',
] as const;

export const CONTRIBUTION_OPTIONS = [10, 15, 30] as const;

export type ContributionPct = (typeof CONTRIBUTION_OPTIONS)[number];
