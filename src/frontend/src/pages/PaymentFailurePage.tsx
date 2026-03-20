import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Payment Failed
        </h1>
        <p className="text-muted-foreground mb-8">
          We couldn't process your payment. Please try again or use Cash on
          Delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link to="/checkout" data-ocid="payment_failure.retry_link">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/products" data-ocid="payment_failure.shop_link">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
