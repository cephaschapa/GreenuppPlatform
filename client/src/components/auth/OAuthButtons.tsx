import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface OAuthButtonsProps {
  onGoogleClick: () => void;
  onFacebookClick: () => void;
  isLoading?: boolean;
  mode?: "login" | "register";
}

export function OAuthButtons({
  onGoogleClick,
  onFacebookClick,
  isLoading,
  mode = "login",
}: OAuthButtonsProps) {
  const isRegisterMode = mode === "register";

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onGoogleClick}
          disabled={isLoading}
          className="w-full"
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          {isRegisterMode ? "Sign up with Google" : "Login with Google"}
        </Button>

        <Button
          variant="outline"
          onClick={onFacebookClick}
          disabled={isLoading}
          className="w-full"
        >
          <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
          {isRegisterMode ? "Sign up with Facebook" : "Login with Facebook"}
        </Button>
      </div>
    </div>
  );
}
