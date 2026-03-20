import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, Package, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart, usePlaceOrder, useProducts } from "../hooks/useQueries";
import { useCreateCheckoutSession } from "../hooks/useStripe";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products } = useProducts();
  const placeOrder = usePlaceOrder();
  const createStripeSession = useCreateCheckoutSession();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const cartWithDetails = useMemo(() => {
    if (!cartItems || !products) return [];
    return cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
      .filter((item) => !!item.product);
  }, [cartItems, products]);

  const subtotal = useMemo(() => {
    return cartWithDetails.reduce(
      (sum, item) =>
        sum + (Number(item.product!.price) / 100) * Number(item.quantity),
      0,
    );
  }, [cartWithDetails]);

  const total = subtotal; // Always free delivery

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (cartWithDetails.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (paymentMethod === "online") {
      // Stripe online payment
      const items = cartWithDetails.map((item) => ({
        name: item.product!.name,
        price: Number(item.product!.price) / 100,
        quantity: Number(item.quantity),
        imageUrl: item.product!.image?.getDirectURL?.() ?? "",
      }));
      try {
        const session = await createStripeSession.mutateAsync(items);
        window.location.href = session.url;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "stripe_not_configured") {
          toast.error(
            "Online payment is being set up. Please use Cash on Delivery for now.",
          );
          setPaymentMethod("cod");
        } else {
          toast.error("Failed to initiate payment. Please try again.");
        }
      }
      return;
    }

    // COD
    try {
      const orderId = await placeOrder.mutateAsync(address.trim());
      toast.success("Order placed successfully! 🎉");
      navigate({ to: "/order-confirmation/$orderId", params: { orderId } });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  const isLoading = placeOrder.isPending || createStripeSession.isPending;

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* Delivery address */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
            <div className="space-y-2">
              <Label htmlFor="delivery-address">Full Address</Label>
              <Textarea
                id="delivery-address"
                data-ocid="checkout.address_input"
                placeholder="Enter your complete delivery address including flat/house no., street, city, state, and PIN code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            {/* Free delivery badge */}
            <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Free Delivery on this order!</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "cod" | "online")}
              className="space-y-3"
              data-ocid="checkout.payment_select"
            >
              {/* COD */}
              <label
                htmlFor="pay-cod"
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="cod" id="pay-cod" />
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xl">💵</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Pay when your order arrives
                  </p>
                </div>
                {paymentMethod === "cod" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Selected
                  </Badge>
                )}
              </label>

              {/* Online */}
              <label
                htmlFor="pay-online"
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="online" id="pay-online" />
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Pay Online (Card / UPI)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Secure payment via Stripe
                  </p>
                </div>
                {paymentMethod === "online" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Selected
                  </Badge>
                )}
              </label>
            </RadioGroup>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cartWithDetails.map((item) => {
              const price = Number(item.product!.price) / 100;
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.product!.image?.getDirectURL?.() ? (
                      <img
                        src={item.product!.image.getDirectURL()}
                        alt={item.product!.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product!.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity.toString()}
                    </p>
                  </div>
                  <span className="font-medium text-sm">
                    ₹{(price * Number(item.quantity)).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span className="text-primary">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 bg-accent/50 rounded-lg">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <span>Your order will be delivered in 3-7 business days</span>
          </div>

          <Button
            data-ocid="checkout.place_order_button"
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={isLoading || !address.trim()}
          >
            {isLoading
              ? paymentMethod === "online"
                ? "Redirecting to Payment..."
                : "Placing Order..."
              : paymentMethod === "online"
                ? "Pay Online →"
                : "Place Order (COD)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
