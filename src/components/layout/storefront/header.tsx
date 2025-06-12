// src/components/layout/storefront/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  Bell,
  MapPin,
  Phone,
  MessageCircle,
  Grid3X3,
  Smartphone,
  Laptop,
  Home,
  Shirt,
  Car,
  Gamepad2,
  Baby,
  Utensils,
} from "lucide-react";

export function StorefrontHeader() {
  const [cartItemCount] = useState(5);
  const [wishlistCount] = useState(12);
  const [isLoggedIn] = useState(false);

  const categories = [
    {
      name: "Electronics",
      icon: Smartphone,
      href: "/shop/category/electronics",
    },
    { name: "Computers", icon: Laptop, href: "/shop/category/computers" },
    { name: "Fashion", icon: Shirt, href: "/shop/category/fashion" },
    { name: "Home & Living", icon: Home, href: "/shop/category/home" },
    { name: "Automotive", icon: Car, href: "/shop/category/automotive" },
    { name: "Gaming", icon: Gamepad2, href: "/shop/category/gaming" },
    { name: "Baby & Kids", icon: Baby, href: "/shop/category/baby" },
    { name: "Food", icon: Utensils, href: "/shop/category/food" },
  ];

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-orange-500 text-white">
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>1-800-STORE</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>Live Chat</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span>🎉 FREE SHIPPING on orders $35+</span>
              <span>📱 Download App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Categories</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-4">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                      >
                        <IconComponent className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-bold text-orange-600">
                  StoreHub
                </div>
                <div className="text-xs text-gray-500 -mt-1">
                  Best Deals Online
                </div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Input
                  placeholder="Search for products, brands and categories..."
                  className="pl-4 pr-12 h-11 border-2 border-orange-200 focus:border-orange-400 rounded-lg"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 h-9 px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Popular Searches */}
              <div className="hidden md:flex items-center mt-2 space-x-2 text-xs text-gray-600">
                <span>Popular:</span>
                <Link href="/search?q=iphone" className="hover:text-orange-600">
                  iPhone
                </Link>
                <span>•</span>
                <Link href="/search?q=laptop" className="hover:text-orange-600">
                  Laptop
                </Link>
                <span>•</span>
                <Link
                  href="/search?q=clothing"
                  className="hover:text-orange-600"
                >
                  Clothing
                </Link>
                <span>•</span>
                <Link
                  href="/search?q=headphones"
                  className="hover:text-orange-600"
                >
                  Headphones
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Location */}
              <div className="hidden lg:flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Deliver to</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-semibold text-orange-600"
                >
                  New York 10001
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  3
                </Badge>
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/account/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline text-sm">
                      {isLoggedIn ? "John Doe" : "Sign In"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="w-full">
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders" className="w-full">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist" className="w-full">
                          My Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Sign Out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="w-full">
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register" className="w-full">
                          Create Account
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 font-medium"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>All Categories</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <DropdownMenuItem key={category.name} asChild>
                      <Link
                        href={category.href}
                        className="flex items-center space-x-3 w-full"
                      >
                        <IconComponent className="h-4 w-4 text-orange-500" />
                        <span>{category.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center space-x-6 ml-6">
              <Link
                href="/deals"
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                🔥 Todays Deals
              </Link>
              <Link
                href="/flash-sale"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                ⚡ Flash Sale
              </Link>
              <Link
                href="/new-arrivals"
                className="text-sm font-medium hover:text-orange-600"
              >
                ✨ New Arrivals
              </Link>
              <Link
                href="/clearance"
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                💚 Clearance
              </Link>
              <Link
                href="/brands"
                className="text-sm font-medium hover:text-orange-600"
              >
                Top Brands
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
