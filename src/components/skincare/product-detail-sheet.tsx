"use client";

import { useEffect, useRef } from "react";
import { X, Pencil, Trash2, Clock3, Tag, CalendarDays } from "lucide-react";
import type { ShelfProduct } from "@/lib/skincare";
import { SmartProductDialog } from "@/components/skincare/smart-product-dialog";

interface ProductDetailSheetProps {
  product: ShelfProduct | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (product: ShelfProduct) => void;
  onDelete?: (product: ShelfProduct) => void;
}

type CategoryMeta = {
  label: string;
  pillClass: string;
  dotClass: string;
};

const CATEGORY_STYLES: Record<string, CategoryMeta> = {
  cleanser: {
    label: "Cleanser",
    pillClass: "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20",
    dotClass: "bg-sky-400",
  },
  serum: {
    label: "Serum",
    pillClass: "bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20",
    dotClass: "bg-violet-400",
  },
  moisturizer: {
    label: "Moisturizer",
    pillClass: "bg-teal-500/10 text-teal-300 ring-1 ring-teal-400/20",
    dotClass: "bg-teal-400",
  },
  sunscreen: {
    label: "Sunscreen",
    pillClass: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20",
    dotClass: "bg-amber-400",
  },
  exfoliant: {
    label: "Exfoliant",
    pillClass: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-400/20",
    dotClass: "bg-orange-400",
  },
  toner: {
    label: "Toner",
    pillClass: "bg-pink-500/10 text-pink-300 ring-1 ring-pink-400/20",
    dotClass: "bg-pink-400",
  },
  treatment: {
    label: "Treatment",
    pillClass: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20",
    dotClass: "bg-emerald-400",
  },
  mask: {
    label: "Mask",
    pillClass: "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20",
    dotClass: "bg-fuchsia-400",
  },
  "eye cream": {
    label: "Eye Cream",
    pillClass: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20",
    dotClass: "bg-cyan-400",
  },
  "face oil": {
    label: "Face Oil",
    pillClass: "bg-lime-500/10 text-lime-300 ring-1 ring-lime-400/20",
    dotClass: "bg-lime-400",
  },
};

function getCategoryMeta(category: string | null): CategoryMeta {
  const key = (category ?? "").trim().toLowerCase();

  return (
    CATEGORY_STYLES[key] ?? {
      label: category || "Product",
      pillClass: "bg-white/8 text-white/55 ring-1 ring-white/10",
      dotClass: "bg-white/35",
    }
  );
}

function formatDate(value: string | Date | null, fallback = "Not set") {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function isExpiringSoon(expiresAt: string | null) {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function getCreatedAt(product: ShelfProduct): Date | string | null {
  if ("createdAt" in product) {
    return product.createdAt ?? null;
  }

  return null;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass = "text-white/70",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/30">
        <Icon size={13} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/28">
          {label}
        </p>

        <p
          className={`mt-1 text-[13px] font-medium leading-snug ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProductDetailSheet({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!product) return null;

  const meta = getCategoryMeta(product.category);
  const expiringSoon = isExpiringSoon(product.expiresAt);
  const expiryLabel = formatDate(product.expiresAt, "No expiry added");

  return (
    <>
      <div
        ref={overlayRef}
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Desktop — right drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${product.name}`}
        className={`fixed bottom-0 right-0 top-0 z-50 hidden w-[380px] flex-col bg-[#13151f] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:flex ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SheetContent
          product={product}
          meta={meta}
          expiringSoon={expiringSoon}
          expiryLabel={expiryLabel}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </aside>

      {/* Mobile — bottom sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${product.name}`}
        className={`fixed bottom-0 left-0 right-0 z-50 flex max-h-[88dvh] flex-col rounded-t-2xl bg-[#13151f] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <SheetContent
          product={product}
          meta={meta}
          expiringSoon={expiringSoon}
          expiryLabel={expiryLabel}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </aside>
    </>
  );
}

function SheetContent({
  product,
  meta,
  expiringSoon,
  expiryLabel,
  onClose,
  onEdit,
  onDelete,
}: {
  product: ShelfProduct;
  meta: CategoryMeta;
  expiringSoon: boolean;
  expiryLabel: string;
  onClose: () => void;
  onEdit?: (product: ShelfProduct) => void;
  onDelete?: (product: ShelfProduct) => void;
}) {
  const createdAt = getCreatedAt(product) ?? product.openedAt ?? null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden font-satoshi">
      {/* Header */}
      <div className="shrink-0 border-b border-white/8 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${meta.pillClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
              {meta.label}
            </span>

            <h2 className="mt-2 text-[16px] font-bold leading-snug text-[#FFFFE4]">
              {product.name}
            </h2>

            {product.brand ? (
              <p className="mt-0.5 text-[12px] text-white/40">
                {product.brand}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/40 transition hover:bg-white/10 hover:text-white/70"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Detail rows */}
      <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-5">
        <DetailRow icon={Tag} label="Category" value={meta.label} />

        <DetailRow
          icon={Clock3}
          label="Expiry"
          value={
            expiringSoon ? (
              <span className="text-red-300">Expires soon · {expiryLabel}</span>
            ) : (
              expiryLabel
            )
          }
          valueClass={
            expiringSoon
              ? "text-red-300"
              : product.expiresAt
                ? "text-white/70"
                : "text-white/30"
          }
        />

        <DetailRow
          icon={CalendarDays}
          label="Added on"
          value={formatDate(createdAt, "Not available")}
          valueClass={createdAt ? "text-white/70" : "text-white/30"}
        />
      </div>

      {/* Actions */}
      <div className="shrink-0 border-t border-white/8 px-5 py-4">
        <div className="flex flex-col gap-2">
          {/* Add to Ritual — SmartProductDialog with prefill, portal renders above sheet */}
          <SmartProductDialog
            mode="ritual"
            prefill={{
              brand: product.brand ?? "",
              product: {
                id: String(product.id),
                name: product.name,
                brand: product.brand ?? "",
                category: product.category ?? "",
              },
              category: product.category ?? "",
            }}
            onSuccess={onClose}
            trigger={
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl  bg-indigo-500/12 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 cursor-pointer"
              >
                Add to Ritual
              </button>
            }
          />

          <div className="flex items-center gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-500/12 px-4 py-2.5 text-sm font-semibold text-teal-300 transition-all hover:bg-teal-500/20 cursor-pointer"
              >
                <Pencil size={13} />
                Edit product
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="inline-flex items-center justify-center gap-2 rounded-xl  bg-red-500/8 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/15 cursor-pointer"
              >
                <Trash2 className="-mt-1" size={13} />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
