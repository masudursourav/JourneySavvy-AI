interface ImageResult {
  url: string;
  source: "google" | "picsum" | "placeholder";
  isDefault: boolean;
}

interface PlaceImageOptions {
  placeName: string;
  address?: string;
  category?: "hotel" | "restaurant" | "attraction" | "food" | "general";
  width?: number;
  height?: number;
}

// Cache for images to avoid repeated API calls
const imageCache = new Map<string, ImageResult>();

/**
 * Get high-quality image with fallback sources that don't require API keys
 */
export const getPlaceImage = async (
  options: PlaceImageOptions
): Promise<ImageResult> => {
  const {
    placeName,
    address = "",
    category = "general",
    width = 400,
    height = 300,
  } = options;
  const cacheKey = `${placeName}-${address}-${category}-${width}x${height}`;

  // Return cached result if available
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Try Google Places API first (if API key is available)
    const googleResult = await getGooglePlaceImage(
      placeName,
      address,
      width,
      height
    );
    if (googleResult.url) {
      const result: ImageResult = {
        url: googleResult.url,
        source: "google",
        isDefault: false,
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn("Google Places API failed, using fallback images:", error);
  }

  // Fallback to picsum (Lorem Picsum) for beautiful placeholder images
  const picsumResult = getPicsumImage(width, height, placeName);
  const result: ImageResult = {
    url: picsumResult.url,
    source: "picsum",
    isDefault: false,
  };
  imageCache.set(cacheKey, result);
  return result;
};

/**
 * Google Places API implementation (improved error handling)
 */
const getGooglePlaceImage = async (
  placeName: string,
  address: string,
  width: number,
  height: number
): Promise<{ url: string }> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key not found");
  }

  const searchQuery = `${placeName} ${address}`.trim();

  const requestBody = {
    textQuery: searchQuery,
    maxResultCount: 1,
    includedType: "establishment",
  };

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Places API request failed: ${response.status} - ${response.statusText}`
    );
  }

  const data = await response.json();

  if (
    data.places &&
    data.places.length > 0 &&
    data.places[0].photos &&
    data.places[0].photos.length > 0
  ) {
    const photoName = data.places[0].photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=${height}&maxWidthPx=${width}`;
    return { url: photoUrl };
  }

  throw new Error("No photos found in Google Places");
};

/**
 * Picsum (Lorem Picsum) implementation - provides beautiful random images
 */
const getPicsumImage = (
  width: number,
  height: number,
  seed: string
): { url: string } => {
  // Generate a seed based on the place name for consistent images
  const seedNumber = hashCode(seed) % 1000;
  return {
    url: `https://picsum.photos/seed/${seedNumber}/${width}/${height}?random=${Date.now()}`,
  };
};

/**
 * Simple hash function to generate consistent seeds from place names
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Generate placeholder with category-specific styling
 */
/**
 * Specialized functions for different types of places
 */
export const getHotelImage = async (
  hotelName: string,
  address: string
): Promise<ImageResult> => {
  return getPlaceImage({
    placeName: hotelName,
    address,
    category: "hotel",
    width: 400,
    height: 300,
  });
};

export const getAttractionImage = async (
  attractionName: string,
  city?: string
): Promise<ImageResult> => {
  return getPlaceImage({
    placeName: attractionName,
    address: city || "",
    category: "attraction",
    width: 400,
    height: 200,
  });
};

export const getFoodImage = async (
  foodName: string,
  location?: string
): Promise<ImageResult> => {
  return getPlaceImage({
    placeName: foodName,
    address: location || "",
    category: "food",
    width: 300,
    height: 200,
  });
};

export const getRestaurantImage = async (
  restaurantName: string,
  address: string
): Promise<ImageResult> => {
  return getPlaceImage({
    placeName: restaurantName,
    address,
    category: "restaurant",
    width: 400,
    height: 300,
  });
};

/**
 * Get destination hero image
 */
export const getDestinationImage = async (
  destination: string
): Promise<ImageResult> => {
  return getPlaceImage({
    placeName: destination,
    category: "general",
    width: 800,
    height: 400,
  });
};

/**
 * Clear image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
};

/**
 * Get cache size for debugging
 */
export const getImageCacheSize = (): number => {
  return imageCache.size;
};

/**
 * Legacy compatibility functions (to replace the old googlePlacesPhoto.ts functions)
 */
export const getHotelPhoto = getHotelImage;
export const getAttractionPhoto = getAttractionImage;
export const getFoodPhoto = getFoodImage;
