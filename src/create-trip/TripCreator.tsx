import SignInDialog from "@/components/custom/SignInDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { travelPlanner } from "@/lib/AiModel";
import { db } from "@/lib/FireBaseConfig";
import { getUserInfo, isUserAuthenticated } from "@/lib/userUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { CalendarDays, LocationEdit, MapPin, TentTreeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import DatePicker from "../components/custom/DatePicker";
import LoadingOverlay from "../components/custom/LoadingOverlay";
import { loadGoogleMapsAPI } from "../lib/googleMapsLoader";
import { tripFormSchema, type TripFormData } from "../lib/validationSchemas";
import {
  type TripDocument,
  type TripResponse,
  type UserInfo,
} from "../types/tripTypes";
import BudgetSelector from "./BudgetSelector";
import CurrentLocationSelector from "./CurrentLocationSelector";
import DestinationSelector from "./DestinationSelector";
import TravelerSelector from "./TravelerSelector";

function TripCreator() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedCurrentLocation, setSelectedCurrentLocation] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    mode: "onChange",
    defaultValues: {
      currentLocation: "",
      destination: "",
      startDate: undefined,
      days: 5,
      budget: "",
      traveler: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = form;
  const { selectedBudget, selectedTraveler, startDate } = {
    selectedBudget: watch("budget"),
    selectedTraveler: watch("traveler"),
    startDate: watch("startDate"),
  };

  // Load Google Maps API
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

  // Extract city and country from place
  const extractLocationInfo = (place: google.maps.places.PlaceResult) => {
    let cityName = "";
    let countryName = "";

    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes("locality")) {
          cityName = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          if (!cityName) cityName = component.long_name;
        } else if (component.types.includes("country")) {
          countryName = component.long_name;
        }
      }
    }

    return cityName && countryName
      ? `${cityName}, ${countryName}`
      : place.name || place.formatted_address || "selected";
  };

  // Form handlers
  const handleCurrentLocationSelect = async (
    place: google.maps.places.PlaceResult
  ) => {
    setSelectedCurrentLocation(place);
    const cleanLocation = extractLocationInfo(place);
    setValue("currentLocation", cleanLocation);
    await trigger("currentLocation");
  };

  const handleClearCurrentLocation = async () => {
    setSelectedCurrentLocation(null);
    setValue("currentLocation", "");
    await trigger("currentLocation");
  };

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

  const handleDateChange = async (date: Date | undefined) => {
    setValue("startDate", date as Date);
    await trigger("startDate");
  };

  const handleBudgetSelect = async (budget: string) => {
    setValue("budget", budget);
    await trigger("budget");
  };

  const handleTravelerSelect = async (traveler: string) => {
    setValue("traveler", traveler);
    await trigger("traveler");
  };

  const cleanResponse = (response: string) => {
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    return cleaned.trim();
  };

  const onSubmit = async (formData: TripFormData) => {
    console.log("Form data being submitted:", formData);
    if (!isUserAuthenticated()) {
      setIsDialogOpen(true);
      return;
    }

    const userInfo = getUserInfo();
    console.log("User info for trip:", userInfo);

    if (!userInfo) {
      console.error("User info is null");
      toast.error("Please sign in to generate a trip.");
      return;
    }

    try {
      toast.loading("Generating your trip plan...");
      setIsRedirecting(true);
      const response = await travelPlanner(formData);
      const cleanedResponse = cleanResponse(response);
      try {
        const parsedResponse: TripResponse = JSON.parse(cleanedResponse);
        const tripData: TripDocument = {
          userInfo: userInfo as UserInfo,
          formData: {
            ...formData,
            startDate: {
              type: "firestore/timestamp/1.0",
              seconds: Math.floor(formData.startDate.getTime() / 1000),
              nanoseconds: 0,
            },
          },
          createdAt: new Date().toISOString(),
          tripResponse: parsedResponse,
        };
        toast.dismiss();
        await saveToDB(tripData);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.log("Cleaned response:", cleanedResponse);
        toast.dismiss();
        toast.error("Failed to parse trip data. Please try again.");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.dismiss();
      toast.error("Failed to generate trip. Please try again.");
    }
  };

  const saveToDB = async (tripData: TripDocument) => {
    try {
      const tripId = Date.now().toString();
      await setDoc(doc(db, "trips", tripId), {
        ...tripData,
      });
      console.log("Trip saved successfully with ID:", tripId);
      toast.success("Trip saved successfully! Redirecting to view...");
      setTimeout(() => {
        navigate(`/view-trip/${tripId}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Failed to save trip. Please try again.");
    }
  };

  const handleGenerateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Generate Trip button clicked");
    handleSubmit(onSubmit)(e);
  };
  return (
    <>
      <LoadingOverlay
        isVisible={isRedirecting}
        title="Almost There!"
        message="Taking you to your personalized travel itinerary..."
      />
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-56 mt-10 max-w-7xl mx-auto">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#080279] via-[#090979] to-[#00d4ff] bg-clip-text text-transparent tracking-tight leading-tight">
              Tell Us Your Travel Preference{" "}
              <LocationEdit className="inline-block h-7 w-7 md:h-8 md:w-8 ml-2 text-black" />
            </h2>
            <p className="text-lg md:text-xl text-gray-500 mt-4 md:mt-6 tracking-tight max-w-4xl">
              We will use this information to create a personalized trip for
              you. Please answer the following questions to help us understand
              your travel style, interests, and preferences.{" "}
              <TentTreeIcon className="inline-block h-5 w-5 md:h-6 md:w-6 ml-2 text-gray-500" />
            </p>
          </div>
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
              Where are you starting from?{" "}
              <MapPin className="inline-block h-6 w-6 ml-2" />
            </h3>
            <CurrentLocationSelector
              isMapLoaded={isMapLoaded}
              onPlaceSelect={handleCurrentLocationSelect}
              onClearPlace={handleClearCurrentLocation}
              selectedPlace={selectedCurrentLocation}
            />
            {errors.currentLocation && (
              <p className="text-red-500 text-sm mt-2">
                {errors.currentLocation.message}
              </p>
            )}

            <h3 className="text-2xl font-semibold text-gray-800 mb-8 mt-12 flex items-center">
              What is your destination?{" "}
              <MapPin className="inline-block h-6 w-6 ml-2" />
            </h3>
            <DestinationSelector
              isMapLoaded={isMapLoaded}
              onPlaceSelect={handlePlaceSelect}
              onClearPlace={handleClearPlace}
              selectedPlace={selectedPlace}
            />
            {errors.destination && (
              <p className="text-red-500 text-sm mt-2">
                {errors.destination.message}
              </p>
            )}

            <div className="max-w-4xl">
              <h3 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
                Trip Details{" "}
                <CalendarDays className="inline-block h-6 w-6 ml-2" />
              </h3>
              <div className="flex flex-col lg:flex-row lg:gap-8 gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you want to start your trip?
                  </label>
                  <DatePicker
                    date={startDate}
                    onDateChange={handleDateChange}
                    placeholder="Select your trip start date"
                    className="border-2 border-gray-100 w-full"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many days do you plan to travel?
                  </label>
                  <Input
                    placeholder="Ex. 3"
                    type="number"
                    className="py-6 w-full"
                    {...register("days", { valueAsNumber: true })}
                  />
                  {errors.days && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.days.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <BudgetSelector
              selectedBudget={selectedBudget}
              onBudgetSelect={handleBudgetSelect}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-2">
                {errors.budget.message}
              </p>
            )}

            <TravelerSelector
              selectedTraveler={selectedTraveler}
              onTravelerSelect={handleTravelerSelect}
            />
            {errors.traveler && (
              <p className="text-red-500 text-sm mt-2">
                {errors.traveler.message}
              </p>
            )}
          </div>

          <div className="my-12 flex flex-col justify-center items-center">
            <Button
              type="button"
              variant="default"
              disabled={!isValid}
              onClick={handleGenerateTrip}
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
            <SignInDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
          </div>
        </div>
      </form>
    </>
  );
}

export default TripCreator;
