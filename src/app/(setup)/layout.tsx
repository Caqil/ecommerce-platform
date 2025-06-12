import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import "./setup.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Setup - eCommerce Platform Pro",
  description: "Complete your installation setup",
  robots: "noindex, nofollow",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    eCommerce Platform Pro
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Installation Setup Wizard
                  </p>
                </div>
                {children}
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
