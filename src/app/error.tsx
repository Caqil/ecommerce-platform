// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We encountered an unexpected error. Please try again.
            </p>
          </div>

          {/* Error Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Error Details
              </CardTitle>
              <CardDescription>
                The following error occurred while processing your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "An unexpected error occurred"}
                </AlertDescription>
              </Alert>

              {isDevelopment && error.stack && (
                <div className="mt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      Technical Details (Development Mode)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                </div>
              )}

              {error.digest && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Error ID:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {error.digest}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button onClick={reset} className="w-full" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Help Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                If this error persists, here are some things you can try
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Refresh the page</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sometimes a simple refresh can resolve temporary issues
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Clear your browser cache</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Outdated cached files might be causing conflicts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Contact support</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      If the problem continues, please reach out to our support
                      team
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/pages/contact">Contact Support</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/pages/faq">View FAQ</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We apologize for the inconvenience and appreciate your patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
