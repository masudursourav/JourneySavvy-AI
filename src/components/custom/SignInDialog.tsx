import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchUserInfo } from "@/lib/userUtils";
import { useGoogleLogin } from "@react-oauth/google";
import { CircleUser } from "lucide-react";
import { Button } from "../ui/button";

export default function SignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(false);
    }
  };
  const logIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      localStorage.setItem("user", JSON.stringify(tokenResponse));
      try {
        await fetchUserInfo();
        // Dispatch event to notify header of auth change
        window.dispatchEvent(new CustomEvent("authStateChanged"));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to your account to continue. Sign in with your Google
            account to access your trips, preferences, and personalized
            recommendations.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => logIn()} variant={"outline"} className="w-full">
          <CircleUser className="h-6 w-6 text-black" /> Sign in with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
