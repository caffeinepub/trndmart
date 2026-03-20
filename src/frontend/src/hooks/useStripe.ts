import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface ShoppingItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as any;
      if (typeof a.createCheckoutSession !== "function") {
        throw new Error("stripe_not_configured");
      }
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await a.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}

export function useIsStripeConfigured() {
  const { actor } = useActor();
  return async (): Promise<boolean> => {
    if (!actor) return false;
    const a = actor as any;
    if (typeof a.isStripeConfigured !== "function") return false;
    try {
      return await a.isStripeConfigured();
    } catch {
      return false;
    }
  };
}
