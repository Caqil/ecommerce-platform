// src/app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4 animate-bounce">
              404
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Page Not Found
              </CardTitle>
              <CardDescription className="text-lg">
                Sorry, we couldnt find the page you are looking for. It might
                have been moved, deleted, or you entered the wrong URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/">
                  <Button className="w-full" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Search Store</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/search">
                  <Button variant="outline" size="sm" className="w-full">
                    Search Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Home className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Browse Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/shop">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Get Help</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/pages/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>
                Browse our most popular product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/shop/category/electronics">
                  <Button variant="outline" size="sm">
                    Electronics
                  </Button>
                </Link>
                <Link href="/shop/category/clothing">
                  <Button variant="outline" size="sm">
                    Clothing
                  </Button>
                </Link>
                <Link href="/shop/category/home-garden">
                  <Button variant="outline" size="sm">
                    Home & Garden
                  </Button>
                </Link>
                <Link href="/shop/category/sports">
                  <Button variant="outline" size="sm">
                    Sports
                  </Button>
                </Link>
                <Link href="/shop/category/books">
                  <Button variant="outline" size="sm">
                    Books
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
