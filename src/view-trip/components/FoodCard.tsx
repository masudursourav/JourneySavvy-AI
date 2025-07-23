import type { Food } from "@/types/tripTypes";
import { useEffect, useState } from "react";
import { getFoodImage } from "../../lib/finalImageService";

interface FoodCardProps {
  food: Food;
}

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadFoodPhoto = async () => {
      try {
        setIsLoadingImage(true);
        const photo = await getFoodImage(food.name);
        if (photo.url) {
          setImageUrl(photo.url);
        } else if (food.imageUrl) {
          setImageUrl(food.imageUrl);
        } else {
          setImageUrl("");
        }
      } catch {
        if (food.imageUrl) {
          setImageUrl(food.imageUrl);
        } else {
          setImageUrl("");
        }
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadFoodPhoto();
  }, [food.name, food.imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);

      const fetchFallbackImage = async () => {
        try {
          setIsLoadingImage(true);
          const photo = await getFoodImage(food.name, undefined, 1);
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
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0">
          {isLoadingImage ? (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={food.name}
              className="w-full h-full object-cover rounded-lg"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg">🍽️</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-lg">{food.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{food.details}</p>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
