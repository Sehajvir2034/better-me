import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProductCategory =
  | "cleanser"
  | "toner"
  | "serum"
  | "moisturizer"
  | "sunscreen"
  | "exfoliant"
  | "eye cream"
  | "face oil"
  | "treatment"
  | "mask";

type Product = {
  name: string;
  category: ProductCategory;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
    code?: number;
    status?: string;
  };
};

const ALLOWED_CATEGORIES: ProductCategory[] = [
  "cleanser",
  "toner",
  "serum",
  "moisturizer",
  "sunscreen",
  "exfoliant",
  "eye cream",
  "face oil",
  "treatment",
  "mask",
];

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeCategory(value: unknown): ProductCategory | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return ALLOWED_CATEGORIES.includes(normalized as ProductCategory)
    ? (normalized as ProductCategory)
    : null;
}

function parseProducts(input: unknown): Product[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const products: Product[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const maybeName = "name" in item ? item.name : "";
    const maybeCategory = "category" in item ? item.category : "";

    const name =
      typeof maybeName === "string" ? sanitizeText(maybeName, 120) : "";
    const category = normalizeCategory(maybeCategory);

    if (!name || !category) continue;

    const key = `${name.toLowerCase()}::${category}`;
    if (seen.has(key)) continue;

    seen.add(key);
    products.push({ name, category });

    if (products.length >= 8) break;
  }

  return products;
}

function stripMarkdownFences(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractGeminiErrorMessage(
  data: GeminiResponse | Record<string, unknown>,
) {
  if (
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return "Gemini request failed.";
}

async function callGemini(params: {
  model: string;
  apiKey: string;
  prompt: string;
}) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: params.prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      }),
      cache: "no-store",
    },
  );

  const data: GeminiResponse | Record<string, unknown> = await res
    .json()
    .catch(() => ({}));

  return { res, data };
}

export async function GET(req: NextRequest) {
  const brand = sanitizeText(req.nextUrl.searchParams.get("brand") ?? "", 80);
  const query = sanitizeText(req.nextUrl.searchParams.get("query") ?? "", 80);

  if (!brand) {
    return NextResponse.json(
      {
        error: "Missing required brand parameter.",
        code: "MISSING_BRAND",
        products: [],
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[skincare-products] Missing GEMINI_API_KEY");
    return NextResponse.json(
      {
        error: "Server configuration error.",
        code: "MISSING_API_KEY",
        products: [],
      },
      { status: 500 },
    );
  }

  const prompt = [
    `Return a JSON array of real skincare products from the brand "${brand}".`,
    query
      ? `Prioritize products matching this search query: "${query}".`
      : "Return a varied set of popular products from the brand.",
    'Each item must exactly follow this shape: {"name":"string","category":"cleanser|toner|serum|moisturizer|sunscreen|exfoliant|eye cream|face oil|treatment|mask"}',
    "Return 5 to 8 items.",
    "Do not include explanations.",
    "Do not include markdown.",
    "Return only raw JSON.",
  ].join("\n");

  try {
    const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

    let finalRes: Response | null = null;
    let finalData: GeminiResponse | Record<string, unknown> = {};
    let modelUsed: string | null = null;

    for (const model of modelsToTry) {
      const { res, data } = await callGemini({
        model,
        apiKey,
        prompt,
      });

      if (res.ok) {
        finalRes = res;
        finalData = data;
        modelUsed = model;
        break;
      }

      const upstreamError = extractGeminiErrorMessage(data);

      console.error(
        `[skincare-products] Gemini error on model ${model}:`,
        res.status,
        upstreamError,
      );

      const isRetriable = res.status === 429 || res.status >= 500;

      if (!isRetriable) {
        finalRes = res;
        finalData = data;
        modelUsed = model;
        break;
      }
    }

    if (!finalRes) {
      return NextResponse.json(
        {
          error: "AI service is temporarily unavailable.",
          code: "NO_MODEL_RESPONSE",
          products: [],
        },
        { status: 502 },
      );
    }

    if (!finalRes.ok) {
      const upstreamError = extractGeminiErrorMessage(finalData);

      if (finalRes.status === 429) {
        return NextResponse.json(
          {
            error:
              "Product suggestions are temporarily unavailable because the AI rate limit was reached on both primary and fallback models. Please try again later.",
            code: "RATE_LIMITED",
            products: [],
          },
          { status: 429 },
        );
      }

      if (finalRes.status >= 500) {
        return NextResponse.json(
          {
            error: "AI service is temporarily unavailable.",
            code: "UPSTREAM_ERROR",
            products: [],
          },
          { status: 502 },
        );
      }

      return NextResponse.json(
        {
          error: upstreamError,
          code: "GEMINI_ERROR",
          products: [],
        },
        { status: 502 },
      );
    }

    const safeGeminiData = finalData as GeminiResponse;

    const firstCandidate = safeGeminiData.candidates?.[0];
    const candidateParts: GeminiPart[] = firstCandidate?.content?.parts ?? [];

    const text = candidateParts
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return NextResponse.json(
        {
          error: "AI returned an empty response.",
          code: "EMPTY_RESPONSE",
          products: [],
        },
        { status: 502 },
      );
    }

    const cleaned = stripMarkdownFences(text);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error(
        `[skincare-products] Invalid JSON from Gemini (${modelUsed ?? "unknown model"}):`,
        cleaned,
        err,
      );
      return NextResponse.json(
        {
          error: "AI returned invalid JSON.",
          code: "INVALID_JSON",
          products: [],
        },
        { status: 502 },
      );
    }

    const products = parseProducts(parsed);

    return NextResponse.json(
      {
        products,
        modelUsed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[skincare-products] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Unexpected server error while fetching product suggestions.",
        code: "SERVER_ERROR",
        products: [],
      },
      { status: 500 },
    );
  }
}
