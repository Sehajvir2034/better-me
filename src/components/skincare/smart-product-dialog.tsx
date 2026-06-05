"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2, Plus, Search } from "lucide-react";
import { addRitualProduct, addShelfProduct } from "@/lib/skincare-actions";
import { findSkincareProduct } from "@/lib/skincare-knowledge";
import { toast } from "sonner";
import { getToastStyle } from "@/lib/toast";

const CATEGORIES = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Exfoliant",
  "Eye Cream",
  "Face Oil",
  "Treatment",
  "Mask",
] as const;

const LOCAL_BRANDS = [
  "Minimalist",
  "Plum",
  "Dot & Key",
  "Mamaearth",
  "MCaffeine",
  "Re'equil",
  "Derma Co",
  "Fixderma",
  "SkinKraft",
  "Wow Skin Science",
  "Lotus Herbals",
  "Forest Essentials",
  "Kama Ayurveda",
  "Biotique",
  "Himalaya",
  "Lakme",
  "Pond's",
  "Nivea",
  "Garnier",
  "Neutrogena",
  "COSRX",
  "Some By Mi",
  "Innisfree",
  "Klairs",
  "Anua",
  "Purito",
  "Skin1004",
  "Torriden",
  "Isntree",
  "Haruharu Wonder",
  "Medicube",
  "By Wishtrend",
  "Axis-Y",
  "CeraVe",
  "The Ordinary",
  "La Roche-Posay",
  "Cetaphil",
  "Avene",
  "Bioderma",
  "Vichy",
  "Paula's Choice",
  "The INKEY List",
  "Good Molecules",
  "Drunk Elephant",
  "Tatcha",
  "Glow Recipe",
  "Kiehl's",
  "Mario Badescu",
  "First Aid Beauty",
] as const;

export interface SmartProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
}

interface ApiProduct {
  name: string;
  category?: string;
}

interface Prefill {
  brand: string;
  product: SmartProduct;
  category?: string;
}

interface Props {
  mode: "ritual" | "shelf";
  timeOfDay?: "am" | "pm";
  trigger?: React.ReactNode;
  prefill?: Prefill;
  onSuccess?: () => void;
}

type Step = "brand" | "product";

async function searchBrands(query: string): Promise<string[]> {
  if (query.trim().length < 2) return [];

  const lower = query.trim().toLowerCase();

  // Normalize to a dedupe key: lowercase, strip all punctuation and spaces
  function toKey(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, ""); // strip everything except letters and digits
  }

  // Prefer the longer, more complete brand name when two share the same key
  function preferBetter(a: string, b: string): string {
    if (b.length > a.length) return b;
    // Same length — prefer the one with more uppercase (more properly cased)
    const scoreCase = (s: string) =>
      [...s].filter((c) => c >= "A" && c <= "Z").length;
    return scoreCase(a) >= scoreCase(b) ? a : b;
  }

  const localMatches = LOCAL_BRANDS.filter((brand) =>
    toKey(brand).includes(toKey(query)),
  );

  let apiResults: string[] = [];

  try {
    const res = await fetch(
      `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query,
      )}&search_simple=1&action=process&json=1&page_size=60`,
      { signal: AbortSignal.timeout(4000) },
    );

    if (!res.ok) return localMatches.slice(0, 10);

    const data: { products?: Array<{ brands?: string }> } = await res.json();

    const scored = new Map<string, { raw: string; score: number }>();

    for (const product of data.products ?? []) {
      const raw = product.brands?.split(",")?.[0]?.trim();
      if (!raw || raw.length < 2) continue;

      const normalizedBrand = raw.toLowerCase();
      const key = toKey(raw);

      let score = 0;
      if (normalizedBrand.startsWith(lower)) {
        score = 3;
      } else if (normalizedBrand.includes(lower)) {
        score = 2;
      } else if (
        toKey(lower)
          .split("")
          .filter((_, i) => i % 2 === 0) // rough word fragment check
          .join("") &&
        toKey(normalizedBrand).includes(toKey(lower))
      ) {
        score = 1;
      }

      if (score === 0) continue;

      const existing = scored.get(key);
      if (!existing || score > existing.score) {
        scored.set(key, { raw, score });
      } else if (score === existing.score) {
        scored.set(key, { raw: preferBetter(existing.raw, raw), score });
      }
    }

    apiResults = Array.from(scored.values())
      .sort((a, b) => b.score - a.score)
      .map(({ raw }) => raw);
  } catch {
    apiResults = [];
  }

  // Merge local and API results, deduplicating by normalized key
  const canonical = new Map<string, string>();

  // Local matches take priority as seed
  for (const brand of localMatches) {
    canonical.set(toKey(brand), brand);
  }

  // API results fill in gaps or upgrade existing entries
  for (const brand of apiResults) {
    const key = toKey(brand);
    if (canonical.has(key)) {
      canonical.set(key, preferBetter(canonical.get(key)!, brand));
    } else {
      canonical.set(key, brand);
    }
  }

  return Array.from(canonical.values()).slice(0, 10);
}

async function fetchProductsFromAI(
  brand: string,
  query = "",
): Promise<SmartProduct[]> {
  const res = await fetch(
    `/api/skincare-products?brand=${encodeURIComponent(
      brand,
    )}&query=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );

  const data: { error?: string; products?: ApiProduct[] } = await res.json();

  if (res.status === 429) {
    throw new Error(
      data.error ||
        "Product suggestions are temporarily busy. Please try again in a minute.",
    );
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch products");
  }

  return (data.products ?? []).map((product, index) => ({
    id: `${brand}-${product.name}-${index}`,
    name: product.name,
    brand,
    category: product.category ?? "",
  }));
}

export function SmartProductDialog({
  mode,
  timeOfDay,
  trigger,
  prefill,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("brand");

  const [brandQuery, setBrandQuery] = useState("");
  const [brandResults, setBrandResults] = useState<string[]>([]);
  const [isBrandSearching, setIsBrandSearching] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");

  const [products, setProducts] = useState<SmartProduct[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SmartProduct | null>(
    null,
  );
  const [showProductList, setShowProductList] = useState(true);

  const [category, setCategory] = useState("");
  const [amPm, setAmPm] = useState<"am" | "pm" | "both">(timeOfDay ?? "am");
  const [instructions, setInstructions] = useState("");

  // Shelf-only fields
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [expiresAt, setExpiresAt] = useState("");

  const brandDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productRequestIdRef = useRef(0);
  const brandInputRef = useRef<HTMLInputElement>(null);

  const smartInfo = selectedProduct
    ? findSkincareProduct(selectedProduct.name)
    : null;

  // Apply prefill when dialog opens
  useEffect(() => {
    if (open && prefill) {
      setSelectedBrand(prefill.brand);
      setBrandQuery(prefill.brand);
      setSelectedProduct(prefill.product);
      setCategory(prefill.category?.toLowerCase() ?? "");
      setShowProductList(false);
      setStep("product");
    }
  }, [open]);

  useEffect(() => {
    if (!open || step !== "brand") return;

    const timeout = setTimeout(() => {
      brandInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeout);
  }, [open, step]);

  useEffect(() => {
    return () => {
      if (brandDebounceRef.current) clearTimeout(brandDebounceRef.current);
      if (productDebounceRef.current) clearTimeout(productDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (step !== "product" || !selectedBrand || !showProductList) return;

    if (productDebounceRef.current) clearTimeout(productDebounceRef.current);

    const trimmedQuery = productQuery.trim();

    productDebounceRef.current = setTimeout(
      async () => {
        const requestId = ++productRequestIdRef.current;

        setIsProductLoading(true);
        setProductError("");

        try {
          const nextProducts = await fetchProductsFromAI(
            selectedBrand,
            trimmedQuery,
          );

          if (requestId !== productRequestIdRef.current) return;

          setProducts(nextProducts);
        } catch (error) {
          if (requestId !== productRequestIdRef.current) return;

          setProducts([]);
          setProductError(
            error instanceof Error
              ? error.message
              : "Failed to load product suggestions",
          );
        } finally {
          if (requestId === productRequestIdRef.current) {
            setIsProductLoading(false);
          }
        }
      },
      trimmedQuery.length >= 2 ? 450 : 0,
    );

    return () => {
      if (productDebounceRef.current) clearTimeout(productDebounceRef.current);
    };
  }, [productQuery, selectedBrand, step, showProductList]);

  function reset() {
    if (brandDebounceRef.current) clearTimeout(brandDebounceRef.current);
    if (productDebounceRef.current) clearTimeout(productDebounceRef.current);

    productRequestIdRef.current += 1;

    setStep("brand");
    setBrandQuery("");
    setBrandResults([]);
    setSelectedBrand("");
    setProducts([]);
    setProductQuery("");
    setIsBrandSearching(false);
    setIsProductLoading(false);
    setProductError("");
    setSelectedProduct(null);
    setShowProductList(true);
    setCategory("");
    setAmPm(timeOfDay ?? "am");
    setInstructions("");
    setPercentRemaining(100);
    setExpiresAt("");
  }

  function handleBrandQuery(value: string) {
    setBrandQuery(value);
    setBrandResults([]);
    setSelectedBrand("");

    if (brandDebounceRef.current) clearTimeout(brandDebounceRef.current);

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setIsBrandSearching(false);
      return;
    }

    setIsBrandSearching(true);

    brandDebounceRef.current = setTimeout(async () => {
      const results = await searchBrands(trimmed);
      setBrandResults(results);
      setIsBrandSearching(false);
    }, 300);
  }

  async function handleSelectBrand(brand: string) {
    setSelectedBrand(brand);
    setBrandQuery(brand);
    setBrandResults([]);
    setStep("product");
    setSelectedProduct(null);
    setProductQuery("");
    setShowProductList(true);
    setCategory("");
    setProductError("");
    setProducts([]);
    setIsProductLoading(true);

    const requestId = ++productRequestIdRef.current;

    try {
      const initialProducts = await fetchProductsFromAI(brand);

      if (requestId !== productRequestIdRef.current) return;

      setProducts(initialProducts);
    } catch (error) {
      if (requestId !== productRequestIdRef.current) return;

      setProducts([]);
      setProductError(
        error instanceof Error
          ? error.message
          : "Failed to load product suggestions",
      );
    } finally {
      if (requestId === productRequestIdRef.current) {
        setIsProductLoading(false);
      }
    }
  }

  function handleSelectProduct(product: SmartProduct) {
    setSelectedProduct(product);
    setShowProductList(false);
    setProductError("");

    if (product.category) {
      setCategory(product.category.toLowerCase());
    }
  }

  function handleBackToBrand() {
    // If opened via prefill, close entirely instead of going back
    if (prefill) {
      setOpen(false);
      reset();
      return;
    }

    productRequestIdRef.current += 1;
    setStep("brand");
    setSelectedBrand("");
    setSelectedProduct(null);
    setProducts([]);
    setProductQuery("");
    setProductError("");
    setShowProductList(true);
    setCategory("");
    setIsProductLoading(false);
  }

  function handleChangeProduct() {
    setSelectedProduct(null);
    setShowProductList(true);
    setCategory("");
    setProductError("");
  }

  function handleSubmit() {
    if (!selectedProduct || !selectedBrand) return;

    startTransition(async () => {
      try {
        if (mode === "ritual") {
          await addRitualProduct({
            productId: prefill?.product?.id
              ? Number(prefill.product.id)
              : undefined,
            name: selectedProduct.name,
            brand: selectedBrand,
            category: category || undefined,
            amPm,
            instructions: instructions.trim() || undefined,
          });

          toast("Added to ritual", {
            description: `${selectedProduct.name} added to your ${amPm.toUpperCase()} ritual`,
            icon: "🧴",
            style: getToastStyle("default", "dark"),
          });
        } else {
          await addShelfProduct({
            name: selectedProduct.name,
            brand: selectedBrand,
            category: category || undefined,
            percentRemaining,
            expiresAt: expiresAt || undefined,
          });

          toast("Added to shelf", {
            description: `${selectedProduct.name} added to your product shelf`,
            icon: "🧴",
            style: getToastStyle("default", "dark"),
          });
        }

        setOpen(false);
        reset();
        onSuccess?.();
      } catch (error) {
        toast("Could not add product", {
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong while adding this product.",
          style: getToastStyle("default", "dark"),
        });
      }
    });
  }

  const dialogTitle = mode === "ritual" ? "Add to Ritual" : "Add to Shelf";
  const submitLabel = mode === "ritual" ? "Add to Ritual" : "Add to Shelf";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white/45 transition-all hover:text-white/55">
            <Plus className="-mr-1.5" size={15} />
            {dialogTitle}
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] max-w-sm overflow-x-hidden overflow-y-auto rounded-2xl bg-[#13151f] p-6 text-white">
        <DialogHeader>
          <DialogTitle className="text-center font-satoshi text-xl font-bold tracking-wider text-[#FFFFE4]">
            {step === "brand" ? (
              dialogTitle
            ) : (
              <div className="relative flex items-center justify-center gap-2">
                <button
                  onClick={handleBackToBrand}
                  className="absolute left-0 text-white/30 transition-colors hover:text-white/60"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <span>{selectedBrand}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 w-full min-w-0 space-y-4 font-satoshi">
          {/* ── Step 1: Brand ───────────────────────────────────── */}
          {step === "brand" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-bold capitalize tracking-wider text-[#FFFFE4]">
                Brand<span className="text-red-400/60 -ml-1.5">*</span>
              </Label>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                />
                <Input
                  ref={brandInputRef}
                  value={brandQuery}
                  onChange={(e) => handleBrandQuery(e.target.value)}
                  placeholder="e.g. CeraVe, Himalaya, La Roche-Posay..."
                  className=" bg-white/5 pl-9 pr-8 font-semibold text-[#FFFFE4] placeholder:text-white/20"
                />
                {isBrandSearching && (
                  <Loader2
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-white/30"
                  />
                )}
              </div>

              {brandResults.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1c2a]">
                  {brandResults.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => void handleSelectBrand(brand)}
                      type="button"
                      className="w-full border-b border-white/4 px-4 py-2.5 text-left text-sm font-semibold text-white/70 transition-colors last:border-0 hover:bg-white/5 hover:text-[#FFFFE4]"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}

              {!isBrandSearching &&
                brandQuery.trim().length >= 2 &&
                brandResults.length === 0 && (
                  <p className="px-1 text-xs font-semibold text-white/25">
                    Not found —{" "}
                    <button
                      onClick={() => void handleSelectBrand(brandQuery.trim())}
                      type="button"
                      className="text-teal-400 underline underline-offset-2"
                    >
                      use &quot;{brandQuery.trim()}&quot; anyway
                    </button>
                  </p>
                )}

              <p className="pt-2 text-center text-sm font-semibold text-white/40">
                Search for a brand to continue
              </p>
            </div>
          )}

          {/* ── Step 2: Product + mode-specific fields ──────────── */}
          {step === "product" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold tracking-wider text-[#FFFFE4]">
                  Product Name{" "}
                  <span className="text-red-400/60 -ml-1.5">*</span>
                </Label>

                {selectedProduct && !showProductList ? (
                  <div className="flex min-w-0 items-start justify-between gap-2 overflow-hidden rounded-xl bg-teal-500/8 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#FFFFE4]">
                        {selectedProduct.name}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-white/30">
                        {selectedBrand}
                      </p>
                    </div>

                    <button
                      onClick={handleChangeProduct}
                      type="button"
                      className="shrink-0 text-xs font-bold text-teal-400/60 underline underline-offset-2 transition-colors hover:text-teal-400"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                      />
                      <Input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder={`Search ${selectedBrand} products...`}
                        className="bg-white/5 pl-9 font-semibold text-[#FFFFE4] placeholder:text-white/20"
                      />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1c2a]">
                      {isProductLoading ? (
                        <div className="flex items-center gap-2 px-4 py-4 text-sm font-semibold text-white/45">
                          <Loader2 size={13} className="animate-spin" />
                          Fetching {selectedBrand} products...
                        </div>
                      ) : productError ? (
                        <div className="space-y-2 px-4 py-4">
                          <p className="text-sm font-semibold text-red-300/80">
                            {productError}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              void handleSelectBrand(selectedBrand)
                            }
                            className="text-sm font-bold text-teal-400 underline underline-offset-2"
                          >
                            Retry
                          </button>
                        </div>
                      ) : products.length === 0 ? (
                        <p className="px-4 py-4 text-sm font-semibold text-white/25">
                          No products found — try typing a product name above
                        </p>
                      ) : (
                        <div className="max-h-50 overflow-y-auto">
                          {products.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSelectProduct(product)}
                              type="button"
                              className="w-full border-b border-white/4 px-4 py-2.5 text-left text-sm font-semibold text-white/70 transition-colors last:border-0 hover:bg-white/5 hover:text-[#FFFFE4]"
                            >
                              <span>{product.name}</span>
                              {product.category && (
                                <span className="ml-2 text-xs capitalize text-white/45">
                                  {product.category}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Smart tip — shown in both modes */}
              {smartInfo && (
                <div className="space-y-1.5 rounded-xl bg-blue-500/8 p-3">
                  <p className="text-sm font-bold tracking-wider text-blue-400">
                    Smart Tip
                  </p>
                  <p className="text-sm font-normal leading-relaxed text-white/60">
                    {smartInfo.tip}
                  </p>
                  {smartInfo.caution && (
                    <p className="text-xs font-normal text-yellow-400/80">
                      ⚠️ {smartInfo.caution}
                    </p>
                  )}
                </div>
              )}

              {/* Category — shown in both modes */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold tracking-wider text-[#FFFFE4]">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 font-medium text-white/70">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1c2a] text-white">
                    {CATEGORIES.map((item) => (
                      <SelectItem
                        key={item}
                        value={item.toLowerCase()}
                        className="font-satoshi font-medium text-white/70 focus:bg-white/5 focus:text-white"
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Ritual-only fields ───────────────────────────── */}
              {mode === "ritual" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold tracking-wider text-white/40">
                      Use In
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["am", "pm", "both"] as const).map((value) => (
                        <Button
                          key={value}
                          type="button"
                          onClick={() => setAmPm(value)}
                          className={`rounded-xl border py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                            amPm === value
                              ? "border-primary bg-primary text-[#FFFFE4]"
                              : "border-white/8 bg-white/4 text-white/30 hover:text-white/50"
                          }`}
                        >
                          {value === "both" ? "Both" : value.toUpperCase()}
                        </Button>
                      ))}
                    </div>

                    {smartInfo &&
                      smartInfo.bestTime !== "both" &&
                      smartInfo.bestTime !== amPm &&
                      amPm !== "both" && (
                        <p className="px-1 text-sm font-semibold text-yellow-400/70">
                          ⚠️ Typically used in the{" "}
                          <button
                            onClick={() => setAmPm(smartInfo.bestTime)}
                            type="button"
                            className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
                          >
                            {smartInfo.bestTime.toUpperCase()}
                          </button>{" "}
                          — tap to switch
                        </p>
                      )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold tracking-wider text-white/40">
                      Instructions{" "}
                      <span className="normal-case text-white/20">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Apply 2–3 drops, avoid eye area..."
                      rows={2}
                      className="resize-none bg-white/5 font-semibold text-white placeholder:text-white/20"
                    />
                  </div>
                </>
              )}

              {/* ── Shelf-only fields ────────────────────────────── */}
              {mode === "shelf" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold tracking-wider text-[#FFFFE4]">
                      How full is it?{" "}
                      <span className="normal-case text-white/45">
                        ({percentRemaining}%)
                      </span>
                    </Label>
                    <Slider
                      value={[percentRemaining]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) =>
                        setPercentRemaining(value[0] ?? 0)
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-semibold text-[#FFFFE4]">
                      <span>Empty</span>
                      <span>Full</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold tracking-wider text-[#FFFFE4]">
                      Expiry date{" "}
                      <span className="normal-case text-white/45">
                        (optional)
                      </span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-auto justify-start rounded-xl border-white/10 bg-white/5 font-medium text-[#FFFFE4] hover:bg-white/10 hover:text-[#FFFFE4]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {expiresAt ? (
                            format(new Date(expiresAt), "PPP")
                          ) : (
                            <span className="text-white/45">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiresAt ? new Date(expiresAt) : undefined}
                          onSelect={(date) =>
                            setExpiresAt(date ? format(date, "yyyy-MM-dd") : "")
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isPending || !selectedProduct}
                className="h-10 w-full justify-self-center items-center flex rounded-xl border border-teal-500/30 bg-teal-500/20 font-satoshi font-semibold text-teal-400 hover:bg-teal-500/30"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Adding...
                  </span>
                ) : (
                  submitLabel
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
