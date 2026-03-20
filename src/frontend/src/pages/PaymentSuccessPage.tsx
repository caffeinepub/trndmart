import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your order has been placed. You will receive a confirmation shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link to="/orders" data-ocid="payment_success.orders_link">
              View My Orders
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/products" data-ocid="payment_success.shop_link">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
