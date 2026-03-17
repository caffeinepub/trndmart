import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SignUpPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) navigate({ to: "/" });
  }, [identity, navigate]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Join TrNDMart
          </h1>
          <p className="text-muted-foreground">
            Create your account and start shopping
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-bold">
                1
              </div>
              <span>Create a secure Internet Identity</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-bold">
                2
              </div>
              <span>Set up your profile name</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-bold">
                3
              </div>
              <span>Start shopping with cash on delivery!</span>
            </div>
          </div>

          <Button
            data-ocid="auth.signup_button"
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base font-semibold"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
