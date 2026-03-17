import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ShieldCheck, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimAdmin,
  useRegisterUser,
  useUserProfile,
} from "../hooks/useQueries";

export function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: profile, isFetched, isLoading } = useUserProfile();
  const registerUser = useRegisterUser();
  const claimAdmin = useClaimAdmin();
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminSectionOpen, setAdminSectionOpen] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const isAuthenticated = !!identity;
  const showModal =
    !dismissed &&
    isAuthenticated &&
    isFetched &&
    !isLoading &&
    profile === null;

  const isPending = registerUser.isPending || claimAdmin.isPending;

  const handleSave = async () => {
    if (!name.trim()) return;
    setAdminError("");

    try {
      await registerUser.mutateAsync(name.trim());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // If user is already registered, just close the modal
      if (message.includes("already registered")) {
        setDismissed(true);
        return;
      }
      toast.error("Failed to create account. Please try again.");
      return;
    }

    if (adminCode.trim()) {
      try {
        await claimAdmin.mutateAsync(adminCode.trim());
        toast.success("Welcome, Store Owner! Admin access granted.");
      } catch {
        setAdminError(
          "Invalid admin code. You're registered as a regular customer.",
        );
        toast.success(`Welcome to TrNDMart, ${name.trim()}!`);
      }
    } else {
      toast.success(`Welcome to TrNDMart, ${name.trim()}!`);
    }
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        if (!open) setDismissed(true);
      }}
    >
      <DialogContent className="sm:max-w-md" data-ocid="profile.dialog">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-primary" />
            <DialogTitle className="font-display text-2xl">
              Namaskar! 🙏
            </DialogTitle>
          </div>
          <DialogDescription>
            Welcome to TrNDMart! Enter your name to start shopping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Your Name *</Label>
            <Input
              id="profile-name"
              data-ocid="profile.input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !adminSectionOpen && handleSave()
              }
              autoFocus
            />
          </div>

          <Collapsible
            open={adminSectionOpen}
            onOpenChange={setAdminSectionOpen}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                data-ocid="profile.toggle"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Store owner? Enter your admin code</span>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform ${
                    adminSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <Label htmlFor="admin-code">Admin Code</Label>
              <Input
                id="admin-code"
                data-ocid="profile.admin_input"
                type="text"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  setAdminError("");
                }}
              />
              {adminError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="profile.error_state"
                >
                  {adminError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only TrNDMart store owners have an admin code. Regular customers
                can leave this blank.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Button
            data-ocid="profile.submit_button"
            className="w-full"
            onClick={handleSave}
            disabled={!name.trim() || isPending}
          >
            {isPending ? "Setting up..." : "Continue Shopping 🛒"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
