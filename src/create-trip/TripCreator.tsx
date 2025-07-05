import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocationEdit, MapPin, TentTreeIcon, TramFront } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { loadGoogleMapsAPI } from "../lib/googleMapsLoader";
import { tripFormSchema, type TripFormData } from "../lib/validationSchemas";
import BudgetSelector from "./BudgetSelector";
import DestinationSelector from "./DestinationSelector";
import TravelerSelector from "./TravelerSelector";

function TripCreator() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    mode: "onChange",
    defaultValues: {
      destination: selectedPlace
        ? selectedPlace.formatted_address || selectedPlace.name
        : "",
      days: 5,
      budget: "",
      customBudget: "",
      traveler: "",
      customTravelerCount: "",
    },
  });

  const selectedBudget = watch("budget");
  const selectedTraveler = watch("traveler");
  const customBudget = watch("customBudget");
  const customTravelerCount = watch("customTravelerCount");

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

  const handlePlaceSelect = async (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    setValue(
      "destination",
      place.formatted_address || place.name || "selected"
    );
    await trigger("destination");
  };

  const handleClearPlace = async () => {
    setSelectedPlace(null);
    setValue("destination", "");
    await trigger("destination");
  };

  const handleBudgetSelect = async (budget: string) => {
    setValue("budget", budget);
    if (budget !== "other") {
      setValue("customBudget", "");
    }
    await trigger(["budget", "customBudget"]);
  };

  const handleTravelerSelect = async (traveler: string) => {
    setValue("traveler", traveler);
    if (traveler !== "other") {
      setValue("customTravelerCount", "");
    }
    await trigger(["traveler", "customTravelerCount"]);
  };

  const handleCustomBudgetChange = async (value: string) => {
    setValue("customBudget", value);
    await trigger("customBudget");
  };

  const handleCustomTravelerChange = async (value: string) => {
    setValue("customTravelerCount", value);
    await trigger("customTravelerCount");
  };

  const onSubmit = (formData: TripFormData) => {};
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          {errors.destination && (
            <p className="text-red-500 text-sm mt-2">
              {errors.destination.message}
            </p>
          )}

          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
              How many days do you plan to travel?{" "}
              <TramFront className="inline-block h-6 w-6 ml-2" />
            </h3>
            <Input
              placeholder="Ex. 3"
              type="number"
              className="py-6"
              {...register("days", { valueAsNumber: true })}
            />
            {errors.days && (
              <p className="text-red-500 text-sm mt-2">{errors.days.message}</p>
            )}
          </div>

          <BudgetSelector
            selectedBudget={selectedBudget}
            onBudgetSelect={handleBudgetSelect}
            customBudget={customBudget}
            onCustomBudgetChange={handleCustomBudgetChange}
          />
          {errors.budget && (
            <p className="text-red-500 text-sm mt-2">{errors.budget.message}</p>
          )}
          {errors.customBudget && (
            <p className="text-red-500 text-sm mt-2">
              {errors.customBudget.message}
            </p>
          )}

          <TravelerSelector
            selectedTraveler={selectedTraveler}
            onTravelerSelect={handleTravelerSelect}
            customTravelerCount={customTravelerCount}
            onCustomTravelerChange={handleCustomTravelerChange}
          />
          {errors.traveler && (
            <p className="text-red-500 text-sm mt-2">
              {errors.traveler.message}
            </p>
          )}
          {errors.customTravelerCount && (
            <p className="text-red-500 text-sm mt-2">
              {errors.customTravelerCount.message}
            </p>
          )}
        </div>

        <div className="my-12 flex flex-col justify-center items-center">
          <Button
            type="submit"
            variant="default"
            disabled={!isValid}
            className={`px-8 py-3 text-lg font-semibold transition-all duration-200 ${
              !isValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg hover:scale-105"
            }`}
          >
            Generate Trip
          </Button>
          {!isValid && (
            <p className="text-red-500 text-sm mt-2">
              Please fill out all required fields correctly.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

export default TripCreator;
