import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SignInPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) navigate({ to: "/" });
  }, [identity, navigate]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-2xl text-primary">
              T
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your TrNDMart account
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <div className="bg-accent/50 rounded-lg p-4 text-sm text-center text-muted-foreground">
            🔐 TrNDMart uses <strong>Internet Identity</strong> — a secure,
            privacy-preserving login system.
          </div>

          <Button
            data-ocid="auth.signin_button"
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base font-semibold"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In with Internet Identity"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New to TrNDMart?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
