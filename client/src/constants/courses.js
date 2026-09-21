export const LEVEL_OPTIONS = [
  { value: 'all', label: 'All levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export const DURATION_OPTIONS = [
  { value: 'all', label: 'Any length' },
  { value: 'under-3h', label: 'Under 3 hours', minDuration: 0, maxDuration: 179 },
  { value: '3-6h', label: '3–6 hours', minDuration: 180, maxDuration: 359 },
  { value: '6-12h', label: '6–12 hours', minDuration: 360, maxDuration: 719 },
  { value: '12h-plus', label: '12+ hours', minDuration: 720 },
];

export const RATING_OPTIONS = [
  { value: 'all', label: 'Any rating' },
  { value: '4', label: '4.0 & up' },
  { value: '4.5', label: '4.5 & up' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'title', label: 'A–Z' },
];

export const LEVEL_STYLES = {
  BEGINNER: 'bg-success/10 text-success',
  INTERMEDIATE: 'bg-primary/10 text-primary',
  ADVANCED: 'bg-warning/10 text-warning',
};