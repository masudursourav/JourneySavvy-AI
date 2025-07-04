import { ArrowRight, Map, MapPin } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

function Hero() {
  return (
    <div className="flex flex-col items-center mx-16 md:mx-56 gap-8">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center mt-16">
        <span className="bg-gradient-to-r from-[#080279] via-[#090979] to-[#00d4ff] bg-clip-text text-transparent">
          Discover Your World:
        </span>{" "}
        AI Crafts Your Perfect, Personalized Travel Itinerary.{" "}
        <Map className="inline-block h-8 w-8 ml-2" />
      </h1>
      <p className="text-lg md:text-xl text-center mt-4 text-gray-500">
        Uncover Your Perfect Trip. Personalized Itineraries Crafted by Advanced
        Intelligence. <MapPin className="inline-block h-6 w-6 ml-2" />
      </p>
      <Link to="/create-trip">
        <Button variant="default" className="mt-8 px-6 h-12">
          Get Started, it's Free <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

export default Hero;
