import { getUserInfo } from "@/lib/userUtils";
import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const userInfo = getUserInfo();
  const isAuthenticated = !!userInfo;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(
        "Please sign in to view your trips. You will be redirected to the home page.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
