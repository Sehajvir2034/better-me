"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Package2,
  Plus,
  Sparkles,
  Clock3,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { ShelfProduct } from "@/lib/skincare";
import {
  removeShelfOnly,
  archiveProductEverywhere,
  updateShelfProduct,
} from "@/lib/skincare-actions";
import { ProductDetailSheet } from "@/components/skincare/product-detail-sheet";
import { SmartProductDialog } from "@/components/skincare/smart-product-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProductShelfProps {
  products: ShelfProduct[];
  onProductClick?: (product: ShelfProduct) => void;
  productHref?: (product: ShelfProduct) => string;
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

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return null;

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function isExpiringSoon(expiresAt: string | null) {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function MiniShelfCard({
  product,
  href,
  onClick,
}: {
  product: ShelfProduct;
  href?: string;
  onClick?: (product: ShelfProduct) => void;
}) {
  const meta = getCategoryMeta(product.category);
  const expiryText = formatExpiry(product.expiresAt);
  const expiringSoon = isExpiringSoon(product.expiresAt);

  const content = (
    <div className="flex h-full min-h-39 flex-col rounded-2xl border border-white/8 bg-[#181b26] p-3.5 font-satoshi transition-all duration-200 group-hover:border-white/15 group-hover:bg-[#1c2030]">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${meta.pillClass}`}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`}
          />
          <span className="truncate">{meta.label}</span>
        </span>

        <ChevronRight
          size={14}
          className="mt-0.5 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/40"
        />
      </div>

      <div className="mt-3">
        <p className="line-clamp-2 min-h-[2.6rem] text-[14px] font-semibold leading-[1.3rem] text-[#FFFFE4]">
          {product.name}
        </p>

        {product.brand ? (
          <p className="mt-1 truncate text-[11px] text-white/35">
            {product.brand}
          </p>
        ) : (
          <div className="mt-1 h-4" />
        )}
      </div>

      <div className="mt-auto pt-3">
        <div className="flex items-center gap-1.5 text-[11px]">
          {expiryText ? (
            <>
              <Clock3
                size={12}
                className={
                  expiringSoon
                    ? "shrink-0 text-red-300"
                    : "shrink-0 text-white/30"
                }
              />
              <span className={expiringSoon ? "text-red-300" : "text-white/35"}>
                {expiringSoon
                  ? `Expires soon · ${expiryText}`
                  : `Expires ${expiryText}`}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={12} className="shrink-0 text-white/25" />
              <span className="text-white/30">No expiry added</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group block"
        aria-label={`Open ${product.name}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(product)}
      className="group block w-full text-left"
      aria-label={`Open ${product.name}`}
    >
      {content}
    </button>
  );
}

function EditProductDialog({
  open,
  product,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  product: ShelfProduct | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    brand?: string;
    category?: string;
    percentRemaining?: number;
    expiresAt?: string;
  }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [percentRemaining, setPercentRemaining] = useState(
    product?.percentRemaining ?? 100,
  );
  const [expiresAt, setExpiresAt] = useState(product?.expiresAt ?? "");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md rounded-2xl bg-[#13151f] p-6 text-white">
        <DialogHeader>
          <DialogTitle className="font-satoshi text-xl font-bold text-[#FFFFE4]">
            Edit product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 font-satoshi">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold tracking-wider text-white/40">
              Product name <span className="text-red-400/60">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hydrating Facial Cleanser"
              className="border-white/10 bg-white/5 font-semibold text-[#FFFFE4] placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold tracking-wider text-white/40">
              Brand{" "}
              <span className="normal-case text-white/20">(optional)</span>
            </Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. CeraVe"
              className="border-white/10 bg-white/5 font-semibold text-[#FFFFE4] placeholder:text-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold tracking-wider text-white/40">
              How full is it?{" "}
              <span className="normal-case text-white/20">
                ({percentRemaining}%)
              </span>
            </Label>
            <input
              type="range"
              min={0}
              max={100}
              value={percentRemaining}
              onChange={(e) => setPercentRemaining(Number(e.target.value))}
              className="w-full accent-teal-400"
            />
            <div className="flex justify-between text-[10px] font-semibold text-white/25">
              <span>Empty</span>
              <span>Full</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold tracking-wider text-white/40">
              Expiry date{" "}
              <span className="normal-case text-white/20">(optional)</span>
            </Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border-white/10 bg-white/5 text-[#FFFFE4]"
            />
          </div>

          <Button
            disabled={pending || !name.trim()}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                brand: brand.trim() || undefined,
                percentRemaining,
                expiresAt: expiresAt || undefined,
              })
            }
            className="h-10 w-full rounded-xl border border-teal-500/30 bg-teal-500/20 font-satoshi font-bold text-teal-400 hover:bg-teal-500/30"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductShelf({
  products,
  onProductClick,
  productHref,
}: ProductShelfProps) {
  const [selectedProduct, setSelectedProduct] = useState<ShelfProduct | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [editProduct, setEditProduct] = useState<ShelfProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ShelfProduct | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "shelf" | "archive" | null
  >(null);

  const handleCardClick = (product: ShelfProduct) => {
    onProductClick?.(product);
    setSelectedProduct(product);
  };

  const expiringSoonCount = products.filter((p) =>
    isExpiringSoon(p.expiresAt),
  ).length;

  return (
    <>
      <div className="rounded-2xl bg-linear-to-r from-indigo-600/8 to-indigo-600/2 p-6 font-satoshi">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-base font-semibold text-[#FFFFE4]">
              Product Shelf
            </p>

            <p className="mt-1 text-sm font-medium text-white/45">
              Your current skincare lineup, organized into a compact shelf.
            </p>

            {products.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/4 px-3.5 py-1.5 text-xs font-medium text-white/45 ">
                  {products.length} products
                </span>

                {expiringSoonCount > 0 ? (
                  <span className="rounded-full bg-red-500/10 px-3.5 py-1.5 text-xs font-medium text-red-300 ">
                    {expiringSoonCount} expiring soon
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <SmartProductDialog
            mode="shelf"
            trigger={
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-teal-500/12 px-4 py-1.5 text-sm font-semibold text-teal-300 transition-all hover:bg-teal-500/20 cursor-pointer"
              >
                <Plus size={14} />
                Add Product
              </button>
            }
          />
        </div>

        {products.length === 0 ? (
          <div className="flex min-h-55 flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-[#1e2235]  px-6 py-10 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/4 text-white/35">
              <Package2 size={28} />
            </div>

            <p className="text-base font-medium text-[#FFFFE4]">
              Your shelf is empty
            </p>

            <p className="mt-1 max-w-[30ch] text-sm text-white/45">
              Add the products you currently use to build your skincare shelf.
            </p>

            <SmartProductDialog
              mode="shelf"
              trigger={
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl  bg-teal-500/12 px-4 py-2.5 text-sm font-semibold text-teal-300 transition-all hover:bg-teal-500/20 cursor-pointer"
                >
                  <Sparkles size={14} />
                  Add your first product
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <MiniShelfCard
                key={product.id}
                product={product}
                href={productHref ? productHref(product) : undefined}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      <ProductDetailSheet
        product={selectedProduct}
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onEdit={(product) => {
          setSelectedProduct(null);
          setEditProduct(product);
        }}
        onDelete={(product) => {
          setSelectedProduct(null);
          setDeleteProduct(product);
        }}
      />

      <EditProductDialog
        key={editProduct ? `edit-${editProduct.id}` : "edit-empty"}
        open={editProduct !== null}
        product={editProduct}
        pending={isPending}
        onClose={() => setEditProduct(null)}
        onSubmit={(data) => {
          if (!editProduct) return;
          startTransition(async () => {
            await updateShelfProduct({ productId: editProduct.id, ...data });
            setEditProduct(null);
          });
        }}
      />

      <Dialog
        open={deleteProduct !== null}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      >
        <DialogContent className="max-w-md rounded-2xl bg-[#13151f] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-center text-xl font-bold text-[#FFFFE4]">
              Remove product from active use
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 font-satoshi">
            <p className="text-sm font-medium text-white/65">
              Choose whether to remove{" "}
              <span className="font-semibold text-[#FFFFE4]">
                {deleteProduct?.name}
              </span>{" "}
              only from your shelf, or archive it from both your shelf and
              ritual. Your past history will be kept.
            </p>

            <div className="grid gap-2 pt-2">
              <Button
                disabled={pendingAction !== null || !deleteProduct}
                className="h-11 rounded-xl bg-white/5 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  if (!deleteProduct) return;
                  setPendingAction("shelf");
                  startTransition(async () => {
                    await removeShelfOnly(deleteProduct.id);
                    setDeleteProduct(null);
                    setPendingAction(null);
                  });
                }}
              >
                {pendingAction === "shelf" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Removing...
                  </span>
                ) : (
                  "Remove from shelf only"
                )}
              </Button>

              <Button
                disabled={pendingAction !== null || !deleteProduct}
                className="h-11 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 cursor-pointer"
                onClick={() => {
                  if (!deleteProduct) return;
                  setPendingAction("archive");
                  startTransition(async () => {
                    await archiveProductEverywhere(deleteProduct.id);
                    setDeleteProduct(null);
                    setPendingAction(null);
                  });
                }}
              >
                {pendingAction === "archive" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Archiving...
                  </span>
                ) : (
                  "Archive from shelf + ritual"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
