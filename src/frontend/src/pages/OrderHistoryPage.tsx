import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Package, ShoppingBag } from "lucide-react";
import { OrderStatus } from "../backend";
import { useOrderHistory } from "../hooks/useQueries";

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "badge-status-pending",
  [OrderStatus.processing]: "badge-status-processing",
  [OrderStatus.shipped]: "badge-status-shipped",
  [OrderStatus.delivered]: "badge-status-delivered",
  [OrderStatus.cancelled]: "badge-status-cancelled",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Pending",
  [OrderStatus.processing]: "Processing",
  [OrderStatus.shipped]: "Shipped",
  [OrderStatus.delivered]: "Delivered",
  [OrderStatus.cancelled]: "Cancelled",
};

function formatIndianDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function OrderHistoryPage() {
  const { data: orders, isLoading } = useOrderHistory();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div
        data-ocid="orders.empty_state"
        className="container mx-auto px-4 py-16 text-center"
      >
        <p className="text-6xl mb-4">📦</p>
        <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">
          Start shopping and your orders will appear here.
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
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={order.id}
            data-ocid={`orders.item.${index + 1}`}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-mono">
                    {order.id}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatIndianDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`border ${STATUS_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </Badge>
                <span className="font-bold text-primary text-lg">
                  ₹{(Number(order.totalAmount) / 100).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
              {" · "}
              <span>
                Deliver to:{" "}
                {order.deliveryAddress.length > 60
                  ? `${order.deliveryAddress.slice(0, 60)}...`
                  : order.deliveryAddress}
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Payment: Cash on Delivery
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
