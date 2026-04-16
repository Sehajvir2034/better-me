// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import { AppPointer } from "@/components/layout/AppPointer";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Better Us",
  description: "Your personal health dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body>
        <TooltipProvider delayDuration={0}>
          <AppPointer>{children}</AppPointer>
        </TooltipProvider>
        <Toaster position="bottom-center" duration={4000} />
      </body>
    </html>
  );
}
