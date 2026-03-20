# TrNDMart

## Current State
- Full-stack Indian e-commerce with authentication, product catalog, cart, Cash on Delivery checkout, order history, and admin panel.
- Delivery fee is ₹50 for orders under ₹500, free above.
- Products shown in a 4-column grid on /products; clicking navigates to a full /products/$id detail page.
- "Store Owner Access" option visible to ALL logged-in non-admin users in the header dropdown, allowing anyone to try the admin code.
- No online payment (only COD).
- No customer support page.
- No real-time data refresh.

## Requested Changes (Diff)

### Add
- **Online Payment (Stripe)**: Add Stripe card payment option in checkout alongside COD. User can choose between COD or Online Payment.
- **Customer Support page** at `/support`: FAQ accordion, contact form (name, email, message), and live chat prompt section.
- **Free Delivery banner**: Always free delivery on all orders (remove ₹50 fee).
- **Real-time polling**: Products and orders data auto-refreshes every 30 seconds.
- **Product Quick View modal**: Clicking a product card opens a modal overlay on the catalog grid (not navigate to full page). Full detail page stays accessible via direct URL.
- **Hidden owner access**: Remove "Store Owner Access" from the header dropdown. Access is only available at `/owner-access` (secret URL), so regular customers never see it.

### Modify
- CheckoutPage: Remove delivery fee logic (always free), add payment method selector (COD vs Stripe), integrate Stripe checkout flow.
- Header: Remove "Store Owner Access" menu item. Keep "Admin Panel" link only for confirmed admins.
- Footer: Add link to /support.
- CatalogPage: Product cards open a QuickViewModal instead of linking to full detail page.
- useQueries: Add `refetchInterval: 30000` to products and orders queries.

### Remove
- ₹50 delivery fee logic from CheckoutPage.
- "Store Owner Access" from header dropdown menu.

## Implementation Plan
1. Select Stripe component.
2. Regenerate backend with Stripe payment type on order (paymentMethod field).
3. Update CheckoutPage: free delivery, payment method choice, Stripe integration.
4. Create /support page with FAQ + contact form.
5. Create /owner-access page to claim admin (moved from header dialog).
6. Update Header to remove Store Owner Access option.
7. Create ProductQuickViewModal component; update ProductCard to open modal instead of navigate.
8. Add refetchInterval to product/order queries.
9. Add /support and /owner-access routes to App.tsx.
