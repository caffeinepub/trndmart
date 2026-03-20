import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Package, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";

interface ProductQuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickViewModal({
  product,
  open,
  onOpenChange,
}: ProductQuickViewModalProps) {
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const priceInRupees = Number(product.price) / 100;
  const imageUrl = product.image?.getDirectURL?.() ?? "";
  const showImage = !!imageUrl && !imgError;

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error("Please sign in to add items to cart");
      onOpenChange(false);
      navigate({ to: "/signin" });
      return;
    }
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      toast.success(`${product.name} added to cart!`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden"
        data-ocid="product_quick_view.dialog"
      >
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="bg-muted aspect-square md:aspect-auto flex items-center justify-center overflow-hidden">
            {showImage ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-64 md:h-full flex items-center justify-center bg-accent">
                <span className="text-6xl">🛍️</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Badge className="bg-primary text-white capitalize text-xs shrink-0">
                  {product.category}
                </Badge>
                {!product.isAvailable && (
                  <Badge variant="destructive" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <DialogTitle className="font-display text-2xl text-left leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground text-sm mb-4 flex-1">
              {product.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-primary">
                  ₹{priceInRupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  Free Delivery
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>
                  {product.stock > 0n
                    ? `${product.stock.toString()} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                data-ocid="product_quick_view.add_cart_button"
                className="w-full bg-primary text-white hover:bg-primary/90 gap-2"
                disabled={!product.isAvailable || addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full gap-2"
                data-ocid="product_quick_view.details_link"
              >
                <Link
                  to="/products/$id"
                  params={{ id: product.id }}
                  onClick={() => onOpenChange(false)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
