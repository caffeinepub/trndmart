import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Package, Star, Truck } from "lucide-react";
import { Category } from "../backend";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORIES = [
  {
    id: Category.electronics,
    label: "Electronics",
    emoji: "📱",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: Category.kitchen,
    label: "Kitchen",
    emoji: "🍳",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: Category.clothing,
    label: "Clothing",
    emoji: "👗",
    color: "bg-pink-50 border-pink-200",
  },
  {
    id: Category.fans,
    label: "Fans",
    emoji: "💨",
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    id: Category.bottles,
    label: "Bottles",
    emoji: "🍶",
    color: "bg-green-50 border-green-200",
  },
  {
    id: Category.toys,
    label: "Toys",
    emoji: "🎮",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: Category.sports,
    label: "Sports",
    emoji: "⚽",
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    id: Category.homeDecor,
    label: "Home Decor",
    emoji: "🏠",
    color: "bg-purple-50 border-purple-200",
  },
];

export function HomePage() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.filter((p) => p.isAvailable).slice(0, 8) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.66 0.19 42) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.35 0.1 155) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
              🇮🇳 Made for India
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              Namaskar! Welcome to{" "}
              <span className="text-primary">TrNDMart</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Shop the best products delivered to your doorstep. Cash on
              Delivery available across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button className="bg-primary text-white hover:bg-primary/90 gap-2 h-12 px-6 text-base">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="h-12 px-6 text-base gap-2">
                  <Package className="h-4 w-4" /> Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free Delivery on ₹500+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">₹</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span>Trusted by 10,000+ customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-3xl font-bold mb-2">
          Shop by Category
        </h2>
        <p className="text-muted-foreground mb-8">
          Find exactly what you&apos;re looking for
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to="/products"
              search={{ category: cat.id }}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 ${cat.color} hover:shadow-card transition-all duration-200 hover:-translate-y-1`}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm font-semibold text-foreground">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold mb-1">
              Featured Products
            </h2>
            <p className="text-muted-foreground">Handpicked for you</p>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <div
                key={k}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div
            data-ocid="product.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-semibold text-lg">No products yet</p>
            <p className="text-sm">
              Products will appear here once added by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
