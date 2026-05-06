import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import type { ShelfProduct } from "@/lib/skincare";

interface Props {
  products: ShelfProduct[];
  userId: string;
}

function isExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
}

function getProgressColor(pct: number | null): string {
  if (pct === null) return "bg-white/20";
  if (pct <= 20) return "bg-red-500";
  if (pct <= 40) return "bg-orange-500";
  return "bg-teal-500";
}

const CATEGORY_COLORS: Record<string, string> = {
  cleanser: "text-blue-400",
  serum: "text-purple-400",
  moisturizer: "text-teal-400",
  sunscreen: "text-yellow-400",
  exfoliant: "text-orange-400",
  toner: "text-pink-400",
};

// Curated placeholder images for common categories
const CATEGORY_IMAGES: Record<string, string> = {
  cleanser:
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
  serum:
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
  moisturizer:
    "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=80",
  sunscreen:
    "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80",
};

export function ProductShelf({ products, userId }: Props) {
  return (
    <div className="rounded-2xl bg-[#13151f] border border-white/8 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧴</span>
          <h2 className="text-base font-bold text-[#FFFFE4] font-satoshi">
            Product Shelf
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold hover:bg-teal-500/20 transition-all">
            <Plus size={12} />
            Add Product
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-bold hover:bg-white/8 transition-all">
            <Settings size={12} />
            Manage All
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map((p) => {
          const expiring = isExpiringSoon(p.expiresAt);
          const pct = p.percentRemaining ?? 100;
          const catKey = (p.category ?? "").toLowerCase();
          const imgSrc =
            p.imageUrl ?? CATEGORY_IMAGES[catKey] ?? CATEGORY_IMAGES.serum;
          const catColor = CATEGORY_COLORS[catKey] ?? "text-white/40";

          return (
            <div
              key={p.id}
              className="relative rounded-xl bg-[#1a1c27] border border-white/8 overflow-hidden group hover:border-white/15 transition-all"
            >
              {/* Expiring badge */}
              {expiring && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold uppercase tracking-wider">
                    Expiring Soon
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="w-full aspect-[4/3] bg-[#0f111a] overflow-hidden">
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${catColor}`}
                >
                  {p.category ?? "Product"}
                </p>
                <p className="text-sm font-semibold text-[#FFFFE4] font-satoshi leading-tight">
                  {p.name}
                </p>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/35">
                    <span>Remaining</span>
                    <span
                      className={pct <= 20 ? "text-red-400" : "text-white/40"}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(p.percentRemaining)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Product card */}
        <button className="rounded-xl border border-dashed border-white/15 hover:border-white/25 bg-transparent min-h-[180px] flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/50 transition-all group">
          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/8 flex items-center justify-center transition-all">
            <Plus size={20} />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">Add New Product</p>
            <p className="text-[10px] text-white/20 mt-0.5">
              Scan barcode or search database
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
