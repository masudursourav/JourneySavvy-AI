import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/FireBaseConfig";
import type { TripDocument } from "@/types/tripTypes";
import { doc, getDoc } from "firebase/firestore";
import { MapPin, Plane, Star, Utensils } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import LoadingOverlay from "../../components/custom/LoadingOverlay";
import AccommodationCard from "../components/AccommodationCard";
import FoodCard from "../components/FoodCard";
import ItineraryCard from "../components/ItineraryCard";
import TripOverview from "../components/TripOverview";
import WeatherCard from "../components/WeatherCard";

function ViewTrip() {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripDetails, setTripDetails] = useState<TripDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const getTripDetails = useCallback(async () => {
    if (!tripId) {
      console.error("Trip ID is not provided");
      toast.error("Trip ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "trips", tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Trip data:", docSnap.data());
        setTripDetails(docSnap.data() as TripDocument);
      } else {
        console.log("No such document!");
        toast.error("Trip not found.");
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Failed to load trip details.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    getTripDetails();
  }, [getTripDetails]);

  if (loading) {
    return (
      <LoadingOverlay
        isVisible={true}
        title="Loading Trip"
        message="Fetching your trip details..."
      />
    );
  }

  if (!tripDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Trip Overview */}
        <TripOverview tripDetails={tripDetails} />

        {/* Weather Information */}
        <WeatherCard weather={tripDetails.tripResponse.weather} />

        {/* Accommodation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Accommodation Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripDetails.tripResponse.accommodation.hotelOptions.map(
                (hotel, index) => (
                  <AccommodationCard key={index} hotel={hotel} />
                )
              )}
            </div>
            {tripDetails.tripResponse.accommodation.accommodationNotes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong>{" "}
                  {tripDetails.tripResponse.accommodation.accommodationNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Available Flights */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Available Flights
                </h3>
                <div className="grid gap-4">
                  {tripDetails.tripResponse.transportation.flights.availableFlights.map(
                    (flight, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-lg">
                              {flight.airline}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Flight {flight.flightNumber}
                            </p>
                            <p className="text-sm">
                              {flight.departureAirport} →{" "}
                              {flight.arrivalAirport}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(flight.departureTime).toLocaleString()}{" "}
                              - {new Date(flight.arrivalTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="mb-2">
                              ${flight.estimatedCost}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {flight.duration}
                            </p>
                            <p className="text-sm text-gray-600">
                              {flight.stops === 0
                                ? "Direct"
                                : `${flight.stops} stop(s)`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Transportation Notes */}
              {tripDetails.tripResponse.transportation.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-700">
                    <strong>Transportation Tips:</strong>{" "}
                    {tripDetails.tripResponse.transportation.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Itinerary */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(tripDetails.tripResponse.itinerary).map(
                ([day, details]) => (
                  <div key={day} className="border-l-4 border-blue-400 pl-4">
                    <h3 className="text-xl font-semibold mb-2 capitalize">
                      {day} -{" "}
                      {new Date(details.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="space-y-3">
                      {details.activities.map((activity, index) => (
                        <ItineraryCard key={index} activity={activity} />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traditional Foods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Traditional Foods to Try
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {tripDetails.tripResponse.traditionalFoods.foods.map(
                (food, index) => (
                  <FoodCard key={index} food={food} />
                )
              )}
            </div>
            {tripDetails.tripResponse.traditionalFoods.foodNotes && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-700">
                  <strong>Food Tips:</strong>{" "}
                  {tripDetails.tripResponse.traditionalFoods.foodNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unique Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Unique Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {tripDetails.tripResponse.uniqueActivities.map(
                (activity, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-lg mb-2">
                      {activity.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <Badge variant="outline">{activity.priceRange}</Badge>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Travel Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Resources & Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">
                    Visa Requirements
                  </h4>
                  <p className="text-sm text-gray-700">
                    {tripDetails.tripResponse.travelResources.visaRequirements}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">Health & Safety</h4>
                  <p className="text-sm text-gray-700">
                    {tripDetails.tripResponse.travelResources.health}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">Safety Tips</h4>
                  <p className="text-sm text-gray-700">
                    {tripDetails.tripResponse.travelResources.safetyTips}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-lg mb-2">Useful Resources</h4>
                <div className="space-y-2">
                  {tripDetails.tripResponse.travelResources.usefulUrls.map(
                    (resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-blue-600 hover:underline">
                          {resource.name}
                        </span>
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewTrip;
