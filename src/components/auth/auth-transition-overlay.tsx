"use client";

import * as React from "react";
import { createPortal } from "react-dom";

interface AuthTransitionOverlayProps {
  open: boolean;
  message: string;
}

export function AuthTransitionOverlay({
  open,
  message,
}: AuthTransitionOverlayProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-sidebar-primary/20 animate-ping" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-primary">
            <span className="font-satoshi text-lg font-bold text-white">B</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-satoshi text-sm font-semibold uppercase tracking-widest text-foreground">
            {message}
          </p>

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
    </div>,
    document.body,
  );
}
