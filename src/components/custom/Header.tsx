import type { UserInfo } from "@/lib/userUtils";
import {
  clearUserData,
  getUserInfo,
  isUserAuthenticated,
} from "@/lib/userUtils";
import { LogOut, Map, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Logo from "../icons/Logo";
import { Button } from "../ui/button";
import SignInDialog from "./SignInDialog";

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isUserAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUserInfo(getUserInfo());
      } else {
        setUserInfo(null);
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    window.addEventListener("authStateChanged", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChanged", checkAuth);
    };
  }, []);

  const handleSignOut = () => {
    clearUserData();
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate("/");
  };

  const handleOpenChange = (open: boolean) => {
    setShowSignInDialog(open);
  };

  return (
    <>
      <header className="sticky top-0 z-50 shadow-sm bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link to={"/"}>
              <div className="flex items-center md:gap-4">
                <Logo className="flex-shrink-0" />
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  JourneySavvy
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <nav className="hidden md:flex items-center gap-4">
                    <Link
                      to="/create-trip"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Trip
                    </Link>
                    <Link
                      to="/my-trips"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Map className="h-4 w-4" />
                      My Trips
                    </Link>
                  </nav>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {userInfo?.picture && (
                      <img
                        src={userInfo.picture}
                        alt={userInfo.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-blue-100"
                      />
                    )}
                    <span className="hidden sm:block text-sm text-gray-700 max-w-24 truncate">
                      {userInfo?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Sign Out</span>
                      <span className="xs:hidden">Out</span>
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="default"
                  className="text-white h-10 px-6 flex-shrink-0"
                  onClick={() => setShowSignInDialog(true)}
                >
                  <User className="h-4 w-4 mr-2" /> Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile navigation for authenticated users */}
          {isAuthenticated && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <nav className="flex justify-center gap-6">
                <Link
                  to="/create-trip"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Trip
                </Link>
                <Link
                  to="/my-trips"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Map className="h-4 w-4" />
                  My Trips
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <SignInDialog open={showSignInDialog} onOpenChange={handleOpenChange} />
    </>
  );
}

export default Header;
