// Ingredient conflict detection for skincare products

export type AlertLevel = "warning" | "caution";

export interface ConflictAlert {
  level: AlertLevel;
  title: string;
  detail: string;
}

interface IngredientRule {
  key: string;
  patterns: string[];
}

const INGREDIENTS: IngredientRule[] = [
  {
    key: "retinol",
    patterns: [
      "retinol",
      "retinoid",
      "tretinoin",
      "retinal",
      "retin-a",
      "differin",
      "adapalene",
    ],
  },
  {
    key: "vitamin-c",
    patterns: [
      "vitamin c",
      "vit c",
      "ascorbic acid",
      "l-ascorbic",
      "ce ferulic",
      "c serum",
    ],
  },
  {
    key: "aha-bha",
    patterns: [
      "aha",
      "bha",
      "glycolic",
      "salicylic",
      "lactic acid",
      "mandelic",
      "peeling",
    ],
  },
  { key: "niacinamide", patterns: ["niacinamide", "niacin b3", "vitamin b3"] },
  {
    key: "benzoyl",
    patterns: ["benzoyl peroxide", "bpo", "benzac", "panoxyl"],
  },
  {
    key: "spf",
    patterns: [
      "spf",
      "sunscreen",
      "broad spectrum",
      "uva/uvb",
      "anthelios",
      "physical sun",
    ],
  },
  {
    key: "peptides",
    patterns: ["peptide", "matrixyl", "argireline", "palmitoyl"],
  },
  {
    key: "acids",
    patterns: [
      "glycolic acid",
      "lactic acid",
      "mandelic acid",
      "salicylic acid",
      "chemical exfol",
    ],
  },
];

const CONFLICT_RULES: Array<{
  a: string;
  b: string;
  level: AlertLevel;
  title: string;
  detail: string;
}> = [
  {
    a: "retinol",
    b: "vitamin-c",
    level: "warning",
    title: "Vitamin C + Retinol in same routine",
    detail:
      "Avoid mixing Vitamin C with Retinol in the same routine. This can cause significant irritation and decrease effectiveness.",
  },
  {
    a: "aha-bha",
    b: "retinol",
    level: "caution",
    title: "AHA/BHA + Retinol",
    detail:
      "BHA 2% Liquid may increase sensitivity when used with active Vitamin C serums or Retinol. Use on alternating nights.",
  },
  {
    a: "benzoyl",
    b: "retinol",
    level: "warning",
    title: "Benzoyl Peroxide + Retinol",
    detail:
      "Benzoyl Peroxide deactivates Retinol and can severely increase dryness. Use on alternate nights.",
  },
  {
    a: "niacinamide",
    b: "vitamin-c",
    level: "caution",
    title: "Niacinamide + High-dose Vitamin C",
    detail:
      "At high concentrations, Niacinamide can reduce Vitamin C effectiveness. Separate by 30 minutes or use at different times.",
  },
  {
    a: "acids",
    b: "retinol",
    level: "caution",
    title: "Chemical Exfoliants + Retinol",
    detail:
      "Layering chemical exfoliants with Retinol can compromise the skin barrier. Alternate usage nights.",
  },
];

function detectIngredients(productName: string): string[] {
  const lower = productName.toLowerCase();
  return INGREDIENTS.filter((rule) =>
    rule.patterns.some((p) => lower.includes(p)),
  ).map((r) => r.key);
}

export function getConflictAlerts(productNames: string[]): ConflictAlert[] {
  const allKeys = productNames.flatMap(detectIngredients);
  const alerts: ConflictAlert[] = [];

  for (const rule of CONFLICT_RULES) {
    if (allKeys.includes(rule.a) && allKeys.includes(rule.b)) {
      alerts.push({
        level: rule.level,
        title: rule.title,
        detail: rule.detail,
      });
    }
  }

  return alerts;
}
