import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "../components/providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doctor Tracker — Clinical Ward Administration",
  description: "Real-time doctor patient load, tracking, and clinical analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
