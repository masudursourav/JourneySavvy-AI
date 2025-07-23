import type { Food } from "@/types/tripTypes";
import { useEffect, useState } from "react";
import { getFoodPhoto } from "../../lib/googlePlacesPhoto";

interface FoodCardProps {
  food: Food;
}

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const [imageUrl, setImageUrl] = useState<string>(food.imageUrl || "");
  const [isLoadingImage, setIsLoadingImage] = useState(!food.imageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadFoodPhoto = async () => {
      if (!food.imageUrl) {
        try {
          setIsLoadingImage(true);
          const photo = await getFoodPhoto(food.name);
          if (photo.url) {
            setImageUrl(photo.url);
          } else {
            setImageUrl("");
          }
        } catch (error) {
          console.error("Error loading food photo:", error);
          setImageUrl("");
        } finally {
          setIsLoadingImage(false);
        }
      }
    };

    loadFoodPhoto();
  }, [food.name, food.imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageUrl("");
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
