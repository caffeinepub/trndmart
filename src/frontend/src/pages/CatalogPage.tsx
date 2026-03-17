import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Category } from "../backend";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.clothing]: "Clothing",
  [Category.fans]: "Fans",
  [Category.toys]: "Toys",
  [Category.bottles]: "Bottles",
  [Category.kitchen]: "Kitchen",
  [Category.sports]: "Sports",
  [Category.electronics]: "Electronics",
  [Category.homeDecor]: "Home Decor",
};

export function CatalogPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string };
  const [searchText, setSearchText] = useState("");
  const selectedCategory = (search.category as Category) ?? null;
  const { data: products, isLoading } = useProducts();

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (selectedCategory)
      list = list.filter((p) => p.category === selectedCategory);
    if (searchText.trim())
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.description.toLowerCase().includes(searchText.toLowerCase()),
      );
    return list;
  }, [products, selectedCategory, searchText]);

  const setCategory = (cat: Category | null) => {
    if (cat) navigate({ to: "/products", search: { category: cat } });
    else navigate({ to: "/products", search: {} });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">All Products</h1>
        <p className="text-muted-foreground">
          {filtered.length} products found
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="catalog.search_input"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground shrink-0">
            Category:
          </span>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          data-ocid="catalog.filter.tab"
          variant={!selectedCategory ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory(null)}
          className={!selectedCategory ? "bg-primary text-white" : ""}
        >
          All
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <Button
            key={cat}
            data-ocid="catalog.filter.tab"
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat as Category)}
            className={selectedCategory === cat ? "bg-primary text-white" : ""}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"].map(
            (k) => (
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
            ),
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="catalog.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-lg">No products found</p>
          <p className="text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i + 1} />
          ))}
        </div>
      )}

      {selectedCategory && (
        <div className="mt-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          <Badge className="bg-primary/10 text-primary gap-1">
            {CATEGORY_LABELS[selectedCategory]}
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="ml-1 hover:text-primary/70"
            >
              &times;
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}
