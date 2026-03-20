import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  CreditCard,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Category, ExternalBlob, OrderStatus } from "../backend";
import type { Product } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useAddProduct,
  useAllOrders,
  useDeleteProduct,
  useProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

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

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Pending",
  [OrderStatus.processing]: "Processing",
  [OrderStatus.shipped]: "Shipped",
  [OrderStatus.delivered]: "Delivered",
  [OrderStatus.cancelled]: "Cancelled",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "badge-status-pending",
  [OrderStatus.processing]: "badge-status-processing",
  [OrderStatus.shipped]: "badge-status-shipped",
  [OrderStatus.delivered]: "badge-status-delivered",
  [OrderStatus.cancelled]: "badge-status-cancelled",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  priceRupees: "",
  category: Category.electronics,
  imageUrl: "",
  stock: "1",
  isAvailable: true,
};

function formatIndianDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PaymentsTab() {
  const { actor } = useActor();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN,US");
  const [saving, setSaving] = useState(false);
  const [reconfigure, setReconfigure] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!actor) return;
      const a = actor as any;
      if (typeof a.isStripeConfigured !== "function") {
        setIsConfigured(false);
        return;
      }
      try {
        const result = await a.isStripeConfigured();
        setIsConfigured(result);
      } catch {
        setIsConfigured(false);
      }
    };
    check();
  }, [actor]);

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Please enter your Stripe Secret Key");
      return;
    }
    setSaving(true);
    try {
      const a = actor as any;
      if (typeof a.setStripeConfiguration !== "function") {
        toast.error("Stripe configuration is not supported in this version.");
        setSaving(false);
        return;
      }
      await a.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries: countries
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
      });
      setIsConfigured(true);
      setReconfigure(false);
      setSecretKey("");
      toast.success("Stripe configured successfully!");
    } catch {
      toast.error("Failed to save Stripe configuration");
    } finally {
      setSaving(false);
    }
  };

  if (isConfigured === null) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-semibold text-lg mb-2">Online Payments</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Configure Stripe to accept online card and UPI payments from customers.
      </p>

      {isConfigured && !reconfigure ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">
                Stripe Payments Active
              </p>
              <p className="text-sm text-green-600">
                Customers can now pay online via card or UPI.
              </p>
            </div>
            <Badge className="ml-auto bg-green-100 text-green-800 border-green-300">
              Active
            </Badge>
          </div>
          <Button
            variant="outline"
            data-ocid="admin.payments.reconfigure_button"
            onClick={() => setReconfigure(true)}
          >
            Reconfigure
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Stripe Configuration</h3>
          </div>
          <div className="space-y-1">
            <Label htmlFor="stripe-key">Stripe Secret Key *</Label>
            <Input
              id="stripe-key"
              data-ocid="admin.payments.secret_key_input"
              type="password"
              placeholder="sk_live_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Stripe Dashboard → Developers → API keys
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="allowed-countries">Allowed Countries</Label>
            <Input
              id="allowed-countries"
              data-ocid="admin.payments.countries_input"
              placeholder="IN,US,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated country codes (e.g. IN,US,GB)
            </p>
          </div>
          <div className="flex gap-2">
            {reconfigure && (
              <Button variant="outline" onClick={() => setReconfigure(false)}>
                Cancel
              </Button>
            )}
            <Button
              data-ocid="admin.payments.save_button"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openAddDialog = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      priceRupees: (Number(product.price) / 100).toString(),
      category: product.category,
      imageUrl: product.image?.getDirectURL?.() ?? "",
      stock: product.stock.toString(),
      isAvailable: product.isAvailable,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.priceRupees) {
      toast.error("Name and price are required");
      return;
    }
    const priceInPaise = BigInt(
      Math.round(Number.parseFloat(form.priceRupees) * 100),
    );
    const stockCount = BigInt(Number.parseInt(form.stock) || 0);

    try {
      if (editProduct) {
        await updateProduct.mutateAsync({
          ...editProduct,
          name: form.name.trim(),
          description: form.description.trim(),
          price: priceInPaise,
          category: form.category,
          image: form.imageUrl
            ? ExternalBlob.fromURL(form.imageUrl)
            : editProduct.image,
          stock: stockCount,
          isAvailable: form.isAvailable,
        });
        toast.success("Product updated!");
      } else {
        const id = crypto.randomUUID();
        await addProduct.mutateAsync({
          id,
          name: form.name.trim(),
          description: form.description.trim(),
          price: priceInPaise,
          category: form.category,
          image: ExternalBlob.fromURL(form.imageUrl || ""),
          stock: stockCount,
          isAvailable: form.isAvailable,
        });
        toast.success("Product added!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Store Panel</h1>
      <p className="text-muted-foreground mb-8">Manage your TrNDMart store</p>

      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            Products ({products?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            Orders ({orders?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="admin.payments.tab">
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg">All Products</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="admin.add_product_button"
                  className="bg-primary text-white hover:bg-primary/90 gap-2"
                  onClick={openAddDialog}
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-lg"
                data-ocid="admin.product.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    {editProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <Label>Product Name *</Label>
                    <Input
                      data-ocid="admin.product.input"
                      placeholder="e.g. Stainless Steel Water Bottle"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      data-ocid="admin.product.textarea"
                      placeholder="Product description..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="299.00"
                        value={form.priceRupees}
                        onChange={(e) =>
                          setForm({ ...form, priceRupees: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={form.stock}
                        onChange={(e) =>
                          setForm({ ...form, stock: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm({ ...form, category: v as Category })
                      }
                    >
                      <SelectTrigger data-ocid="admin.product.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                          <SelectItem key={cat} value={cat}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      data-ocid="admin.product.switch"
                      checked={form.isAvailable}
                      onCheckedChange={(v) =>
                        setForm({ ...form, isAvailable: v })
                      }
                    />
                    <Label>Available for sale</Label>
                  </div>
                </div>
                <Button
                  data-ocid="admin.save_button"
                  className="w-full bg-primary text-white hover:bg-primary/90 mt-2"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {["a", "b", "c", "d", "e"].map((k) => (
                <Skeleton key={k} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No products yet. Add your first product!
                      </TableCell>
                    </TableRow>
                  ) : (
                    products?.map((product, index) => (
                      <TableRow
                        key={product.id}
                        data-ocid={`admin.product.item.${index + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {product.image?.getDirectURL?.() ? (
                                <img
                                  src={product.image.getDirectURL()}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm">
                                  🛍️
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-sm">
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-sm text-muted-foreground">
                          {CATEGORY_LABELS[product.category]}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          ₹
                          {(Number(product.price) / 100).toLocaleString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {product.stock.toString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              data-ocid={`admin.product.delete_button.${index + 1}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-semibold text-lg mb-6">All Orders</h2>
          {ordersLoading ? (
            <div className="space-y-3">
              {["a", "b", "c", "d", "e"].map((k) => (
                <Skeleton key={k} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders?.map((order, index) => (
                      <TableRow
                        key={order.id}
                        data-ocid={`orders.item.${index + 1}`}
                      >
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {order.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          ₹
                          {(Number(order.totalAmount) / 100).toLocaleString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatIndianDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate text-muted-foreground">
                          {order.deliveryAddress}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleStatusUpdate(order.id, v as OrderStatus)
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-32 text-xs"
                              data-ocid="admin.order.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(
                                ([status, label]) => (
                                  <SelectItem key={status} value={status}>
                                    <span
                                      className={`text-xs font-medium ${STATUS_STYLES[status as OrderStatus]?.replace("badge-", "")}`}
                                    >
                                      {label}
                                    </span>
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
