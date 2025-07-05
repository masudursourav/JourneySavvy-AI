import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationEdit, MapPin, TentTreeIcon, TramFront } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadGoogleMapsAPI } from "../lib/googleMapsLoader";
import { tripFormSchema } from "../lib/validationSchemas";
import BudgetSelector from "./BudgetSelector";
import DestinationSelector from "./DestinationSelector";
import TravelerSelector from "./TravelerSelector";

function TripCreator() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);
  const [customBudget, setCustomBudget] = useState<string>("500");
  const [customTravelerCount, setCustomTravelerCount] = useState<string>("3");
  const [days, setDays] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadMapsAPI = async () => {
      try {
        await loadGoogleMapsAPI();
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps API:", error);
      }
    };

    loadMapsAPI();
  }, []);

  // Debug effect to track selectedPlace changes
  useEffect(() => {
    console.log("selectedPlace state updated:", selectedPlace);
  }, [selectedPlace]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    console.log("Selected place:", place);
  };

  const handleClearPlace = () => {
    setSelectedPlace(null);
    console.log("Cleared selected place");
  };

  const handleBudgetSelect = (budget: string) => {
    setSelectedBudget(budget === "" ? null : budget);
  };

  const handleTravelerSelect = (traveler: string) => {
    setSelectedTraveler(traveler === "" ? null : traveler);
  };

  // Real-time validation
  const validateForm = useMemo(() => {
    const formData = {
      destination: selectedPlace
        ? selectedPlace.formatted_address || selectedPlace.name || "selected"
        : "",
      days: days ? Number(days) : 0,
      budget: selectedBudget || "",
      customBudget: selectedBudget === "other" ? customBudget : undefined,
      traveler: selectedTraveler || "",
      customTravelerCount:
        selectedTraveler === "other" ? customTravelerCount : undefined,
    };

    const result = tripFormSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors([]);
    return true;
  }, [
    selectedPlace,
    days,
    selectedBudget,
    customBudget,
    selectedTraveler,
    customTravelerCount,
  ]);

  const handleGenerateTrip = () => {
    if (validateForm) {
      // Handle trip generation
      console.log("Generating trip...", {
        destination: selectedPlace,
        days,
        budget: selectedBudget,
        customBudget: selectedBudget === "other" ? customBudget : undefined,
        traveler: selectedTraveler,
        customTravelerCount:
          selectedTraveler === "other" ? customTravelerCount : undefined,
      });
    }
  };
  return (
    <div className="px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-56 mt-10 max-w-7xl mx-auto">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#080279] via-[#090979] to-[#00d4ff] bg-clip-text text-transparent tracking-tight leading-tight">
          Tell Us Your Travel Preference{" "}
          <LocationEdit className="inline-block h-7 w-7 md:h-8 md:w-8 ml-2 text-black" />
        </h2>
        <p className="text-lg md:text-xl text-gray-500 mt-4 md:mt-6 tracking-tight max-w-4xl">
          We will use this information to create a personalized trip for you.
          Please answer the following questions to help us understand your
          travel style, interests, and preferences.{" "}
          <TentTreeIcon className="inline-block h-5 w-5 md:h-6 md:w-6 ml-2 text-gray-500" />
        </p>
      </div>
      <div className="mt-20">
        <h3 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
          What is your destination?{" "}
          <MapPin className="inline-block h-6 w-6 ml-" />
        </h3>
        <DestinationSelector
          isMapLoaded={isMapLoaded}
          onPlaceSelect={handlePlaceSelect}
          onClearPlace={handleClearPlace}
        />
        <div className="max-w-2xl">
          <h3 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
            How many days do you plan to travel?{" "}
            <TramFront className="inline-block h-6 w-6 ml-2" />
          </h3>
          <Input
            placeholder="Ex. 3"
            type="number"
            className="py-6"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <BudgetSelector
          selectedBudget={selectedBudget}
          onBudgetSelect={handleBudgetSelect}
          customBudget={customBudget}
          onCustomBudgetChange={setCustomBudget}
        />
        <TravelerSelector
          selectedTraveler={selectedTraveler}
          onTravelerSelect={handleTravelerSelect}
          customTravelerCount={customTravelerCount}
          onCustomTravelerChange={setCustomTravelerCount}
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg mt-10">
          <h4 className="text-red-800 font-semibold mb-2">
            Please complete the following:
          </h4>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="my-12 flex justify-center items-center">
        <Button
          variant="default"
          onClick={handleGenerateTrip}
          disabled={!validateForm}
          className={`px-8 py-3 text-lg font-semibold transition-all duration-200 ${
            !validateForm
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-lg hover:scale-105"
          }`}
        >
          Generate Trip
        </Button>
      </div>
    </div>
  );
}

export default TripCreator;
