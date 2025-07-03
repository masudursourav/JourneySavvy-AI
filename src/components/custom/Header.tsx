import { User } from "lucide-react";
import { Link } from "react-router";
import Logo from "../icons/Logo";
import { Button } from "../ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 bg-white text-white transparent">
          <Link to={"/"}>
            <div className="flex items-center md:gap-4">
              <Logo className="flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                JourneySavvy
              </h1>
            </div>
          </Link>
          <Button
            variant="default"
            className="text-white h-10 px-6 flex-shrink-0"
          >
            <User className="h-8 w-8" /> Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
