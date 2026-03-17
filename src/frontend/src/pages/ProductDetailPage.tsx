import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart, useProduct, useProducts } from "../hooks/useQueries";

export function ProductDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useProduct(id ?? "");
  const { data: allProducts } = useProducts();
  const addToCart = useAddToCart();

  const related =
    allProducts
      ?.filter(
        (p) => p.id !== id && p.category === product?.category && p.isAvailable,
      )
      .slice(0, 4) ?? [];
  const priceInRupees = product ? Number(product.price) / 100 : 0;
  const imageUrl = product?.image?.getDirectURL?.() ?? "";

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error("Please sign in to add items to cart");
      navigate({ to: "/signin" });
      return;
    }
    if (!product) return;
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="font-display text-2xl font-bold mb-2">
          Product not found
        </h2>
        <Link to="/products">
          <Button className="bg-primary text-white mt-4">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="gap-2 mb-6"
        onClick={() => navigate({ to: "/products" })}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🛍️
            </div>
          )}
          <Badge className="absolute top-4 left-4 bg-primary text-white capitalize">
            {product.category}
          </Badge>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-4xl font-bold text-primary">
              ₹{priceInRupees.toLocaleString("en-IN")}
            </span>
            {product.isAvailable ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                In Stock ({product.stock.toString()})
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 p-3 bg-accent/50 rounded-lg">
            <Package className="h-4 w-4 text-primary" />
            <span>Cash on Delivery available | Free returns within 7 days</span>
          </div>

          <Button
            data-ocid="product.add_cart_button"
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base gap-2"
            disabled={!product.isAvailable || addToCart.isPending}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {addToCart.isPending ? "Adding to Cart..." : "Add to Cart"}
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
