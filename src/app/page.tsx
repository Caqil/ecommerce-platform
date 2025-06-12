// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Zap,
  Smartphone,
  Laptop,
  Watch,
  Home,
  Car,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StorefrontHeader } from "@/components/layout/storefront/header";
import { StorefrontFooter } from "@/components/layout/storefront/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StoreHub - Your Premium eCommerce Destination",
  description: "Discover amazing products at unbeatable prices. Shop electronics, clothing, home goods, and more with fast shipping and excellent customer service.",
};

// Mock data - in real app this would come from API
const featuredProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 89.99,
    originalPrice: 129.99,
    image: "/images/placeholder-product.png",
    rating: 4.5,
    reviews: 124,
    isNew: false,
    isOnSale: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: null,
    image: "/images/placeholder-product.png",
    rating: 4.8,
    reviews: 89,
    isNew: true,
    isOnSale: false,
  },
  {
    id: 3,
    name: "Ergonomic Office Chair",
    price: 299.99,
    originalPrice: 399.99,
    image: "/images/placeholder-product.png",
    rating: 4.6,
    reviews: 67,
    isNew: false,
    isOnSale: true,
  },
  {
    id: 4,
    name: "Portable Power Bank",
    price: 39.99,
    originalPrice: null,
    image: "/images/placeholder-product.png",
    rating: 4.3,
    reviews: 156,
    isNew: false,
    isOnSale: false,
  },
];

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: Smartphone,
    count: 1240,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Computers",
    slug: "computers",
    icon: Laptop,
    count: 856,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Watches",
    slug: "watches",
    icon: Watch,
    count: 432,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    icon: Home,
    count: 678,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Automotive",
    slug: "automotive",
    icon: Car,
    count: 294,
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Books",
    slug: "books",
    icon: BookOpen,
    count: 1123,
    color: "bg-indigo-100 text-indigo-600",
  },
];

function ProductCard({ product }: { product: typeof featuredProducts[0] }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>
          )}
          {product.isOnSale && (
            <Badge className="absolute top-2 right-2 bg-red-500">Sale</Badge>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button size="icon" variant="secondary" className="rounded-full">
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= product.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StorefrontHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="w-fit">
                  <Zap className="w-3 h-3 mr-1" />
                  New Collection 2024
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Discover Amazing{" "}
                  <span className="text-primary">Products</span> for Your
                  Lifestyle
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Explore our curated collection of premium products designed to
                  enhance your daily life. From cutting-edge electronics to
                  stylish home essentials.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/shop">
                      Shop Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/pages/about">Learn More</Link>
                  </Button>
                </div>
                <div className="flex items-center space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm text-muted-foreground">Products Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                  <Image
                    src="/images/placeholder-product.png"
                    alt="Featured Product"
                    width={400}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Free Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Free shipping on all orders over $50
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">
                  30-day hassle-free return policy
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment information is safe with us
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Round-the-clock customer support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-muted-foreground text-lg">
                Discover our wide range of product categories
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.slug}
                    href={`/shop/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${category.color}`}
                        >
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.count} items
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
                <p className="text-muted-foreground text-lg">
                  Hand-picked products just for you
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/shop">
                  View All
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/shop/product/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay in the Loop
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/80">
              Subscribe to our newsletter for exclusive deals and product updates
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
              <Button
                variant="secondary"
                size="lg"
                className="text-primary font-semibold"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-muted-foreground text-lg">
                Real feedback from real customers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  rating: 5,
                  comment:
                    "Amazing products and fast shipping! I've been shopping here for months and never been disappointed.",
                },
                {
                  name: "Mike Chen",
                  rating: 5,
                  comment:
                    "Excellent customer service and high-quality products. The return process was seamless when needed.",
                },
                {
                  name: "Emma Davis",
                  rating: 5,
                  comment:
                    "Love the variety and competitive prices. The user experience is fantastic and very intuitive.",
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      {testimonial.comment}
                    </p>
                    <div className="font-semibold">{testimonial.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}