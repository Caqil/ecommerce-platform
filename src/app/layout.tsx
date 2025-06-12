// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "eCommerce Platform Pro",
    template: "%s | eCommerce Platform Pro",
  },
  description: "Professional eCommerce platform with addon system",
  keywords: [
    "ecommerce",
    "online store",
    "shopping cart",
    "marketplace",
    "multi-vendor",
    "nextjs",
    "react",
    "typescript",
  ],
  authors: [
    {
      name: "eCommerce Platform Pro Team",
    },
  ],
  creator: "eCommerce Platform Pro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.APP_URL || "http://localhost:3000",
    title: "eCommerce Platform Pro",
    description: "Professional eCommerce platform with addon system",
    siteName: "eCommerce Platform Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "eCommerce Platform Pro",
    description: "Professional eCommerce platform with addon system",
    creator: "@ecommerceplatformpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
