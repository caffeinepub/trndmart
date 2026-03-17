import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useIsAdmin, useIsAuthenticated } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { CartPage } from "./pages/CartPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupModal />
      <Toaster position="top-right" richColors />
    </div>
  );
}

function ProtectedRoute({
  children,
  adminOnly = false,
}: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isInitializing } = useIsAuthenticated();
  const { data: isAdmin } = useIsAdmin();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-display text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (adminOnly && isAdmin === false) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: CatalogPage,
});
const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$id",
  component: ProductDetailPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: () => (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  ),
});
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: () => (
    <ProtectedRoute>
      <OrderHistoryPage />
    </ProtectedRoute>
  ),
});
const orderConfirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation/$orderId",
  component: () => (
    <ProtectedRoute>
      <OrderConfirmationPage />
    </ProtectedRoute>
  ),
});
const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: SignInPage,
});
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignUpPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute adminOnly>
      <AdminPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  checkoutRoute,
  ordersRoute,
  orderConfirmRoute,
  signinRoute,
  signupRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
