// src/app/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { existsSync } from "fs";
import { join } from "path";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Package,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Check if setup is completed
  const setupCompletePath = join(process.cwd(), ".setup-complete");

  if (!existsSync(setupCompletePath)) {
    redirect("/setup");
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to eCommerce Platform Pro
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Your professional eCommerce platform is ready! Choose your next
                step to start building your online store.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage your store, products, orders, and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin">
                    <Button className="w-full" size="lg">
                      Access Admin Panel
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Add Products</CardTitle>
                  <CardDescription>
                    Start by adding your first products to your catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/products/create">
                    <Button variant="outline" className="w-full" size="lg">
                      Add First Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Setup Payments</CardTitle>
                  <CardDescription>
                    Configure payment gateways to accept payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/addons/marketplace">
                    <Button variant="outline" className="w-full" size="lg">
                      Install Payment Addons
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>View Store</CardTitle>
                  <CardDescription>
                    See how your store looks to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/shop">
                    <Button variant="outline" className="w-full" size="lg">
                      Visit Storefront
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Monitor your store performance and sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full" size="lg">
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>Addon Marketplace</CardTitle>
                  <CardDescription>
                    Extend your store with powerful addons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/addons/marketplace">
                    <Button variant="outline" className="w-full" size="lg">
                      Browse Addons
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Guide */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  🚀 Quick Start Guide
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Follow these steps to get your store up and running quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      1
                    </div>
                    <h4 className="font-semibold mb-1">Add Products</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create your product catalog
                    </p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      2
                    </div>
                    <h4 className="font-semibold mb-1">Setup Payments</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install payment gateways
                    </p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      3
                    </div>
                    <h4 className="font-semibold mb-1">Configure Shipping</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set up shipping methods
                    </p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      4
                    </div>
                    <h4 className="font-semibold mb-1">Launch Store</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Go live and start selling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Need help getting started? Check out our documentation and
                support resources.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  📚 Documentation
                </Button>
                <Button variant="outline" size="sm">
                  💬 Support
                </Button>
                <Button variant="outline" size="sm">
                  🎥 Video Tutorials
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
