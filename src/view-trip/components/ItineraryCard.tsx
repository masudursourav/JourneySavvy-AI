import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Activity } from "@/types/tripTypes";
import { DollarSign, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getAttractionPhoto } from "../../lib/googlePlacesPhoto";

interface ItineraryCardProps {
  activity: Activity;
}

const StarRating: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return null;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <Star className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-gray-300" />
      ))}
      <span className="ml-1 text-xs text-gray-600">({rating})</span>
    </div>
  );
};

const ItineraryCard: React.FC<ItineraryCardProps> = ({ activity }) => {
  const [imageUrl, setImageUrl] = useState<string>(activity.imageUrl || "");
  const [isLoadingImage, setIsLoadingImage] = useState(!activity.imageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadAttractionPhoto = async () => {
      if (!activity.imageUrl) {
        try {
          setIsLoadingImage(true);
          const photo = await getAttractionPhoto(activity.placeName);
          if (photo.url) {
            setImageUrl(photo.url);
          } else {
            setImageUrl("");
          }
        } catch (error) {
          console.error("Error loading attraction photo:", error);
          setImageUrl("");
        } finally {
          setIsLoadingImage(false);
        }
      }
    };

    loadAttractionPhoto();
  }, [activity.placeName, activity.imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageUrl("");
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        <div className="w-32 h-24 flex-shrink-0">
          {isLoadingImage ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={activity.placeName}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg">📍</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                {activity.placeName}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {activity.placeDetails}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {activity.rating && <StarRating rating={activity.rating} />}
                {activity.ticketPrice !== null && activity.ticketPrice > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />$
                    {activity.ticketPrice}
                  </Badge>
                )}
                {activity.ticketPrice === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Free
                  </Badge>
                )}
              </div>
              {activity.notes && (
                <p className="text-xs text-blue-600 mt-1 italic">
                  Note: {activity.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItineraryCard;
