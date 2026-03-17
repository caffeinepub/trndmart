import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCart,
  useClearCart,
  useProducts,
  useRemoveFromCart,
} from "../hooks/useQueries";

export function CartPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products } = useProducts();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const cartWithDetails = useMemo(() => {
    if (!cartItems || !products) return [];
    return cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
      .filter((item) => !!item.product);
  }, [cartItems, products]);

  const total = useMemo(() => {
    return cartWithDetails.reduce((sum, item) => {
      const price = Number(item.product!.price) / 100;
      return sum + price * Number(item.quantity);
    }, 0);
  }, [cartWithDetails]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="font-display text-2xl font-bold mb-2">
          Please sign in to view your cart
        </h2>
        <Link to="/signin">
          <Button className="bg-primary text-white mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
        <div className="space-y-4">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!cartWithDetails.length) {
    return (
      <div
        data-ocid="cart.empty_state"
        className="container mx-auto px-4 py-16 text-center"
      >
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Browse our collection and add some items!
        </p>
        <Link to="/products">
          <Button className="bg-primary text-white gap-2">
            <ShoppingBag className="h-4 w-4" /> Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Your Cart</h1>
        <Button
          data-ocid="cart.clear_button"
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleClear}
          disabled={clearCart.isPending}
        >
          {clearCart.isPending ? "Clearing..." : "Clear Cart"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cartWithDetails.map((item, index) => {
            const price = Number(item.product!.price) / 100;
            const imageUrl = item.product!.image?.getDirectURL?.() ?? "";
            return (
              <div
                key={item.productId}
                data-ocid={`cart.item.${index + 1}`}
                className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.product!.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/products/$id"
                    params={{ id: item.productId }}
                    className="font-semibold hover:text-primary truncate block"
                  >
                    {item.product!.name}
                  </Link>
                  <p className="text-muted-foreground text-sm capitalize">
                    {item.product!.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-bold">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      × {item.quantity.toString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-foreground">
                    ₹{(price * Number(item.quantity)).toLocaleString("en-IN")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => handleRemove(item.productId)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-secondary font-medium">
                {total >= 500 ? "Free" : "₹50"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment Method</span>
              <span className="font-medium text-foreground">
                Cash on Delivery
              </span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span className="text-primary">
              ₹{(total >= 500 ? total : total + 50).toLocaleString("en-IN")}
            </span>
          </div>
          <Button
            data-ocid="cart.checkout_button"
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 gap-2"
            onClick={() => navigate({ to: "/checkout" })}
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="mt-3 text-xs text-center text-muted-foreground">
            🔒 Safe &amp; Secure | Cash on Delivery
          </div>
        </div>
      </div>
    </div>
  );
}
