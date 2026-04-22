// components/layout/PageTransition.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Module-level subscribers so nav links can trigger the overlay instantly
const listeners = new Set<(v: boolean) => void>();
export function showPageTransition() {
  listeners.forEach((fn) => fn(true));
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    listeners.add(setShow);
    return () => {
      listeners.delete(setShow);
    };
  }, []);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Page is fully loaded — wait a beat then hide
    const t = setTimeout(() => setShow(false), 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="relative flex-1 min-h-0">
      {children}

      {show && (
        <div
          className="fixed z-20 flex flex-col items-center justify-center bg-background animate-in fade-in duration-200"
          style={{ top: "var(--topbar-height, 57px)", inset: 0 }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-sidebar-primary/20 animate-ping" />
              <div className="h-12 w-12 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="font-satoshi text-lg font-bold text-[#FFFFE4]">
                  B
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
