import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TripDocument } from "@/types/tripTypes";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getDestinationImage } from "../../lib/finalImageService";

interface TripOverviewProps {
  tripDetails: TripDocument;
}

const TripOverview: React.FC<TripOverviewProps> = ({ tripDetails }) => {
  const { tripResponse, formData } = tripDetails;
  const [destinationImageUrl, setDestinationImageUrl] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    const loadDestinationImage = async () => {
      try {
        setIsLoadingImage(true);
        const image = await getDestinationImage(
          tripResponse.tripDetails.destination
        );
        if (image.url) {
          setDestinationImageUrl(image.url);
        }
      } catch {
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadDestinationImage();
  }, [tripResponse.tripDetails.destination]);

  return (
    <Card className="w-full overflow-hidden">
      {destinationImageUrl && (
        <div className="relative h-[400px] overflow-hidden">
          {isLoadingImage ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading destination image...</div>
            </div>
          ) : (
            <img
              src={destinationImageUrl}
              alt={tripResponse.tripDetails.destination}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">
                {tripResponse.tripDetails.destination}
              </h1>
              <p className="text-lg opacity-90">
                Your adventure awaits in this amazing destination
              </p>
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        {!destinationImageUrl && (
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {tripResponse.tripDetails.destination}
          </CardTitle>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            From {tripResponse.tripDetails.origin}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {tripResponse.tripDetails.duration}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {tripResponse.tripDetails.travelers.travelerType}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />$
            {tripResponse.tripDetails.budget.range}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Trip Details</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(
                  tripResponse.tripDetails.startDate
                ).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {formData.days}{" "}
                days
              </p>
              <p>
                <span className="font-medium">Travelers:</span>{" "}
                {tripResponse.tripDetails.travelers.count} (
                {tripResponse.tripDetails.travelers.travelerType})
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Budget Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Total Budget:</span> $
                {tripResponse.tripDetails.budget.range}{" "}
                {tripResponse.tripDetails.budget.currency}
              </p>
              <p>
                <span className="font-medium">Per Person:</span> $
                {tripResponse.tripDetails.budget.perPerson}
              </p>
              <p>
                <span className="font-medium">Currency:</span>{" "}
                {tripResponse.tripDetails.budget.currency}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripOverview;
