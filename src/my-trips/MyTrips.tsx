import LoadingOverlay from "@/components/custom/LoadingOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/FireBaseConfig";
import { getPlacePhoto } from "@/lib/googlePlacesPhoto";
import { getUserInfo } from "@/lib/userUtils";
import type { TripDocument } from "@/types/tripTypes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Calendar, DollarSign, MapPin, Plane, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

interface TripCardProps {
  trip: TripDocument;
  tripId: string;
}

const TripCard = ({ trip, tripId }: TripCardProps) => {
  const { formData, tripResponse } = trip;
  const destinationName =
    formData.destination || tripResponse.tripDetails.destination;
  const startDate = new Date(
    formData.startDate.seconds * 1000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const photo = await getPlacePhoto({
          placeName: destinationName,
          width: 400,
          height: 250,
        });
        setImageUrl(photo.url);
      } catch (error) {
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [destinationName]);

  const fallbackImage = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop&auto=format`;

  return (
    <Link to={`/view-trip/${tripId}`} className="block group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] cursor-pointer h-full bg-white border-0 shadow-lg max-w-2xl mx-auto">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 lg:h-64 xl:h-72 overflow-hidden">
          {imageLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse flex items-center justify-center">
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          ) : (
            <img
              src={imageUrl || fallbackImage}
              alt={destinationName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Destination Name Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-lg line-clamp-2">
              {destinationName}
            </h3>
          </div>

          {/* Duration Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800">
              {formData.days} {formData.days === 1 ? "day" : "days"}
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Trip Details */}
          <div className="space-y-3 lg:space-y-4">
            {/* Date and Traveler Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                <span className="text-sm lg:text-base font-medium">
                  {startDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                <span className="text-sm lg:text-base">
                  {formData.traveler}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-500" />
              <span className="text-sm lg:text-base font-medium text-gray-700">
                Budget:{" "}
                <span className="text-emerald-600 font-semibold">
                  {formData.budget}
                </span>
              </span>
            </div>

            {/* Origin */}
            <div className="flex items-center gap-2 text-gray-500">
              <Plane className="h-4 w-4 text-gray-400" />
              <span className="text-xs lg:text-sm">
                From {formData.currentLocation}
              </span>
            </div>

            {/* Action Indicator */}
            <div className="pt-2 lg:pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-gray-400">
                  Created {new Date(trip.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 text-blue-600 text-xs lg:text-sm font-medium">
                  View Details
                  <svg
                    className="h-3 w-3 lg:h-4 lg:w-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const MyTrips = () => {
  const [trips, setTrips] = useState<{ tripId: string; trip: TripDocument }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userInfo = getUserInfo();
        if (!userInfo) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const tripsQuery = query(
          collection(db, "trips"),
          where("userInfo.email", "==", userInfo.email)
        );

        const querySnapshot = await getDocs(tripsQuery);
        const userTrips: { tripId: string; trip: TripDocument }[] = [];

        querySnapshot.forEach((doc) => {
          userTrips.push({
            tripId: doc.id,
            trip: doc.data() as TripDocument,
          });
        });

        userTrips.sort((a, b) => {
          const dateA = new Date(a.trip.createdAt);
          const dateB = new Date(b.trip.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setTrips(userTrips);
      } catch (error) {
        setError("Failed to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <LoadingOverlay
        isVisible={true}
        title="Loading Your Trips..."
        message="Fetching your amazing travel plans..."
      />
    );
  }

  if (error) {
    return (
      <div className="px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-56 mt-10 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-56 mt-6 sm:mt-10 max-w-7xl mx-auto min-h-screen">
      <div className="text-center lg:text-left mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#080279] via-[#090979] to-[#00d4ff] bg-clip-text text-transparent tracking-tight leading-tight">
          My Trips ✈️
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 mt-3 sm:mt-4 md:mt-6 tracking-tight max-w-4xl">
          Here are all your amazing travel plans. Click on any trip to view the
          detailed itinerary.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 max-w-md mx-auto shadow-lg border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Start planning your next adventure and create your first trip!
            </p>
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
            >
              <Plane className="h-4 w-4" />
              Create Your First Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {trips.map(({ tripId, trip }) => (
            <TripCard key={tripId} trip={trip} tripId={tripId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
