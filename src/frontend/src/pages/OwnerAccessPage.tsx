import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClaimAdmin } from "../hooks/useQueries";

export function OwnerAccessPage() {
  const [code, setCode] = useState("");
  const claimAdmin = useClaimAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      await claimAdmin.mutateAsync(code.trim());
      toast.success("Access granted! Welcome, Store Owner.");
      navigate({ to: "/admin" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      if (lower.includes("sign up") || lower.includes("register")) {
        toast.error("You must create an account first.");
      } else if (
        lower.includes("invalid") ||
        lower.includes("wrong") ||
        lower.includes("incorrect")
      ) {
        toast.error("Wrong code. Please check and try again.");
      } else {
        toast.error(msg || "Wrong code. Please check and try again.");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm" data-ocid="owner_access.card">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-xl">
            Store Owner Access
          </CardTitle>
          <CardDescription>
            Enter your owner code to access the management panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="owner-code">Owner Code</Label>
              <Input
                id="owner-code"
                data-ocid="owner_access.input"
                type="password"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              data-ocid="owner_access.submit_button"
              disabled={!code.trim() || claimAdmin.isPending}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {claimAdmin.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Panel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
