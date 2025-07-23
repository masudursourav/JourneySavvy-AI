import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HotelOption } from "@/types/tripTypes";
import { DollarSign, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getHotelImage } from "../../lib/finalImageService";

interface AccommodationCardProps {
  hotel: HotelOption;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-gray-300" />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({ hotel }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadHotelPhoto = async () => {
      try {
        setIsLoadingImage(true);
        const photo = await getHotelImage(hotel.name, hotel.address);
        if (photo.url) {
          setImageUrl(photo.url);
        } else if (hotel.imageUrl) {
          setImageUrl(hotel.imageUrl);
        } else {
          setImageUrl("");
        }
      } catch {
        if (hotel.imageUrl) {
          setImageUrl(hotel.imageUrl);
        } else {
          setImageUrl("");
        }
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadHotelPhoto();
  }, [hotel.name, hotel.address, hotel.imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);

      const fetchFallbackImage = async () => {
        try {
          setIsLoadingImage(true);
          const photo = await getHotelImage(hotel.name, hotel.address);
          if (photo.url && photo.url !== imageUrl) {
            setImageUrl(photo.url);
            setImageError(false);
          } else {
            setImageUrl("");
          }
        } catch {
          setImageUrl("");
        } finally {
          setIsLoadingImage(false);
        }
      };

      fetchFallbackImage();
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video relative overflow-hidden">
        {isLoadingImage ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🏨</div>
              <div className="text-sm">No image available</div>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            <DollarSign className="w-3 h-3 mr-1" />${hotel.pricePerNight}/night
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 line-clamp-1">
          {hotel.name}
        </CardTitle>
        <StarRating rating={hotel.rating} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">
              {hotel.address}
            </p>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">
            {hotel.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationCard;
