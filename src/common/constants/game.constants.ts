export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

export const SUN = {
  PERFECT_THRESHOLD: 15,
  PARTIAL_THRESHOLD: 45,
  PERFECT_MULTIPLIER: 2,
  PARTIAL_MULTIPLIER: 1,
  WRONG_MULTIPLIER: 0,
  ROTATION_PER_MINUTE: 6,
} as const;

export const WATER = {
  MAX: 100,
  /** Full tank refill interval (10 min — shorter for demo; was 1 hour) */
  REFILL_INTERVAL_MS: 10 * 60 * 1000,
  WATERING_AMOUNT: 25,
  HYDRATION_MAX: 100,
  HYDRATION_DECAY_PER_CYCLE: 3,
  OVERWATER_THRESHOLD: 85,
  OVERWATER_PENALTY: 0.5,
  MIN_HYDRATION_FOR_GROWTH: 5,
} as const;

export const FERTILIZER = {
  BOOST_MULTIPLIER: 1.5,
  BOOST_DURATION_MS: 30 * 60 * 1000,
  DECAY_PER_CYCLE: 2,
  SPAWN_AMOUNT_MIN: 10,
  SPAWN_AMOUNT_MAX: 30,
  SHEEP_MIN_INTERVAL_MS: 20 * 60 * 1000,
  SHEEP_MAX_INTERVAL_MS: 40 * 60 * 1000,
} as const;

export const GROWTH = {
  BASE_POINTS_PER_CYCLE: 10,
  MIN_HEALTH: 0,
  MAX_HEALTH: 100,
} as const;

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_MODIFIERS: Record<Season, number> = {
  spring: 1.2,
  summer: 1.0,
  autumn: 0.9,
  winter: 0.7,
};

export const DAY_CYCLE_MINUTES = 24;
