// src/app/(setup)/setup/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { existsSync } from "fs";
import { join } from "path";

interface SetupLayoutProps {
  children: ReactNode;
}

export default function SetupLayout({ children }: SetupLayoutProps) {
  // Check if setup is already completed
  const setupCompletePath = join(process.cwd(), ".setup-complete");

  if (existsSync(setupCompletePath)) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
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
  );
}
