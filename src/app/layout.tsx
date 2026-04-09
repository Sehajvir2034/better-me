// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import localFont from "next/font/local";

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
  title: "Health Tracker",
  description: "Your personal health dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en" className={satoshi.variable} suppressHydrationWarning>
    //   <body>
    //     <TooltipProvider delayDuration={0}>
    //       <AppShell>
    //         <div className="flex flex-1 flex-col overflow-hidden">
    //           <TopBar />
    //           <main className="flex-1 overflow-y-auto p-6">{children}</main>
    //         </div>
    //       </AppShell>
    //     </TooltipProvider>
    //   </body>
    // </html>
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body>
        <TooltipProvider delayDuration={0}>
          <AppShell>{children}</AppShell> {/* ← just pass children directly */}
        </TooltipProvider>
      </body>
    </html>
  );
}
