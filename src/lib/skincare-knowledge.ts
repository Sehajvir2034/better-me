export type SkincareProductKey =
  | "sunscreen"
  | "vitamin_c"
  | "retinol"
  | "aha"
  | "bha"
  | "hyaluronic_acid"
  | "niacinamide"
  | "rosehip_oil"
  | "squalane"
  | "cleanser"
  | "moisturizer"
  | "toner"
  | "eye_cream"
  | "benzoyl_peroxide"
  | "azelaic_acid"
  | "tretinoin"
  | "snail_mucin";

export type SkincareTime = "am" | "pm" | "both";

export interface SkincareProductInfo {
  key: SkincareProductKey;
  bestTime: SkincareTime;
  tip: string;
  caution?: string;
}

const SKINCARE_KNOWLEDGE: Record<string, SkincareProductInfo> = {
  sunscreen: {
    key: "sunscreen",
    bestTime: "am",
    tip: "Always apply sunscreen as the very last AM step, after moisturizer. Reapply every 2 hours outdoors.",
  },
  "vitamin c": {
    key: "vitamin_c",
    bestTime: "am",
    tip: "Vitamin C neutralises free radicals from UV exposure — most effective in the morning.",
    caution:
      "Don't layer directly with Niacinamide — can cause flushing in some skin types.",
  },
  retinol: {
    key: "retinol",
    bestTime: "pm",
    tip: "Retinol is photosensitive and breaks down in sunlight. Always use at night.",
    caution:
      "Start 2-3x per week to build tolerance. Always follow with moisturizer.",
  },
  tretinoin: {
    key: "tretinoin",
    bestTime: "pm",
    tip: "Prescription-strength retinoid — PM only. Apply to dry skin 20 mins after cleansing.",
    caution: "Avoid with other actives. Always wear SPF the next morning.",
  },
  "glycolic acid": {
    key: "aha",
    bestTime: "pm",
    tip: "AHAs increase photosensitivity — use at night and wear SPF the next morning.",
  },
  "salicylic acid": {
    key: "bha",
    bestTime: "am",
    tip: "BHA penetrates pores and works well in the AM to keep skin clear throughout the day.",
  },
  "benzoyl peroxide": {
    key: "benzoyl_peroxide",
    bestTime: "am",
    tip: "Most effective as a morning treatment to kill acne bacteria throughout the day.",
    caution:
      "Can bleach fabrics — rinse thoroughly and let dry before dressing.",
  },
  "hyaluronic acid": {
    key: "hyaluronic_acid",
    bestTime: "both",
    tip: "Apply to damp skin and seal with moisturizer for best hydration results.",
  },
  niacinamide: {
    key: "niacinamide",
    bestTime: "both",
    tip: "Versatile and well-tolerated — safe for both AM and PM routines.",
  },
  "azelaic acid": {
    key: "azelaic_acid",
    bestTime: "both",
    tip: "Gentle enough for AM and PM. Great for hyperpigmentation and redness.",
  },
  "snail mucin": {
    key: "snail_mucin",
    bestTime: "both",
    tip: "Lightweight humectant — works well under moisturizer in both routines.",
  },
  "rosehip oil": {
    key: "rosehip_oil",
    bestTime: "pm",
    tip: "Facial oils should be the last step to seal in moisture. Best at night.",
  },
  squalane: {
    key: "squalane",
    bestTime: "pm",
    tip: "Lightweight oil that mimics skin's natural sebum. Use as the final PM step.",
  },
  cleanser: {
    key: "cleanser",
    bestTime: "both",
    tip: "Double cleanse at night (oil cleanser first, then water-based). Gentle rinse in the morning.",
  },
  moisturizer: {
    key: "moisturizer",
    bestTime: "both",
    tip: "In AM, apply before sunscreen. In PM, apply as the final step to lock in hydration.",
  },
  toner: {
    key: "toner",
    bestTime: "both",
    tip: "Apply immediately after cleansing on damp skin to prep for serums.",
  },
  "eye cream": {
    key: "eye_cream",
    bestTime: "both",
    tip: "Apply with your ring finger — least pressure. Use before moisturizer.",
  },
};

export function findSkincareProduct(name: string): SkincareProductInfo | null {
  const lower = name.toLowerCase();
  for (const [keyword, info] of Object.entries(SKINCARE_KNOWLEDGE)) {
    if (lower.includes(keyword)) return info;
  }
  return null;
}
