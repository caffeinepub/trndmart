import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    status: OrderStatus;
    deliveryAddress: string;
    userId: Principal;
    createdAt: bigint;
    totalAmount: bigint;
    items: Array<CartItem>;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: string;
    name: string;
    isAvailable: boolean;
    description: string;
    stock: bigint;
    category: Category;
    image: ExternalBlob;
    price: bigint;
}
export enum Category {
    clothing = "clothing",
    fans = "fans",
    toys = "toys",
    bottles = "bottles",
    kitchen = "kitchen",
    sports = "sports",
    electronics = "electronics",
    homeDecor = "homeDecor"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addToCart(item: CartItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(secret: string): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrderHistory(): Promise<Array<Order>>;
    getProduct(productId: string): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(deliveryAddress: string): Promise<string>;
    registerUser(name: string): Promise<void>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
