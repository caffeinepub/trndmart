import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

export function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="bg-card border border-border rounded-2xl p-10 shadow-card">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">
          Order Placed! 🎉
        </h1>
        <p className="text-muted-foreground mb-6">
          Dhanyavaad! Your order has been placed successfully. We will deliver
          it to your doorstep soon.
        </p>

        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <p className="font-mono text-sm font-semibold break-all">{orderId}</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8 justify-center">
          <Package className="h-4 w-4 text-primary" />
          <span>Payment: Cash on Delivery | Delivery: 3-7 business days</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Package className="h-4 w-4" /> Track Orders
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button className="w-full bg-primary text-white hover:bg-primary/90 gap-2">
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
