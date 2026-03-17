import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();
  const navigate = useNavigate();

  const priceInRupees = Number(product.price) / 100;
  const imageUrl = product.image?.getDirectURL?.() ?? "";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!identity) {
      toast.error("Please sign in to add items to cart");
      navigate({ to: "/signin" });
      return;
    }
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

  return (
    <div data-ocid={`product.item.${index}`} className="product-card group">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="relative overflow-hidden bg-muted aspect-[4/3]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent">
              <span className="text-4xl">🛍️</span>
            </div>
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
          <Badge className="absolute top-2 left-2 bg-primary text-white capitalize text-xs">
            {product.category}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-lg text-primary">
              ₹{priceInRupees.toLocaleString("en-IN")}
            </span>
            {product.stock > 0n && (
              <span className="text-xs text-muted-foreground">
                {product.stock.toString()} left
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          data-ocid="product.add_cart_button"
          className="w-full bg-primary text-white hover:bg-primary/90 gap-2"
          disabled={!product.isAvailable || addToCart.isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
