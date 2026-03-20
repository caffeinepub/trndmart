import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Crown, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCart, useIsAdmin, useUserProfile } from "../hooks/useQueries";

export function Header() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: cart } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart?.length ?? 0;

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  const navLinks = [
    { to: "/" as const, label: "Home", ocid: "nav.home_link" },
    { to: "/products" as const, label: "Products", ocid: "nav.products_link" },
    { to: "/support" as const, label: "Support", ocid: "nav.support_link" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">T</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            TrND<span className="text-primary">Mart</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/cart" data-ocid="nav.cart_button" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2 items-center"
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">
                      {profile?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <span className="max-w-[100px] truncate text-sm">
                    {profile?.name ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/orders"
                    data-ocid="nav.orders_link"
                    className="cursor-pointer w-full"
                  >
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      data-ocid="nav.admin_link"
                      className="cursor-pointer w-full flex items-center gap-2"
                    >
                      <Crown className="h-4 w-4 text-primary" />
                      Store Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="nav.signout_button"
                  className="text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/signin" data-ocid="nav.signin_link">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" data-ocid="nav.signup_link">
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                data-ocid="nav.orders_link"
                className="text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  data-ocid="nav.admin_link"
                  className="text-sm font-medium py-2 flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Crown className="h-4 w-4 text-primary" /> Store Panel
                </Link>
              )}
              <button
                type="button"
                data-ocid="nav.signout_button"
                className="text-sm font-medium py-2 text-destructive text-left"
                onClick={() => {
                  handleSignOut();
                  setMobileOpen(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                data-ocid="nav.signin_link"
                className="text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                data-ocid="nav.signup_link"
                className="text-sm font-medium py-2 text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoggingIn && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
    </header>
  );
}
