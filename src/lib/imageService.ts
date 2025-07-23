interface ImageResult {
  url: string;
  source: "google" | "unsplash" | "pexels" | "placeholder";
  isDefault: boolean;
}

interface PlaceImageOptions {
  placeName: string;
  address?: string;
  category?: "hotel" | "restaurant" | "attraction" | "food" | "general";
  width?: number;
  height?: number;
}

const imageCache = new Map<string, ImageResult>();

/**
 * Get high-quality image with multiple fallback sources
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

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
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
  } catch {
    // Intentionally ignore errors from Google Place Image
  }

  try {
    const unsplashResult = await getUnsplashImage(placeName, category);
    if (unsplashResult.url) {
      const result: ImageResult = {
        url: unsplashResult.url,
        source: "unsplash",
        isDefault: false,
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Intentionally ignore errors from Unsplash API
  }

  try {
    const pexelsResult = await getPexelsImage(placeName, category);
    if (pexelsResult.url) {
      const result: ImageResult = {
        url: pexelsResult.url,
        source: "pexels",
        isDefault: false,
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Intentionally ignore errors from Pexels API
  }

  try {
    const picsumResult = getPicsumImage(width, height, placeName);
    if (picsumResult.url) {
      const result: ImageResult = {
        url: picsumResult.url,
        source: "placeholder",
        isDefault: false,
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Intentionally ignore errors from Picsum fallback
  }

  const placeholderResult: ImageResult = {
    url: generatePlaceholderImage(placeName, category, width, height),
    source: "placeholder",
    isDefault: true,
  };
  imageCache.set(cacheKey, placeholderResult);
  return placeholderResult;
};

/**
 * Google Places API implementation
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
    throw new Error(`Google Places API request failed: ${response.status}`);
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
 * Unsplash API implementation (requires access key)
 */
const getUnsplashImage = async (
  placeName: string,
  category: string
): Promise<{ url: string }> => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new Error("Unsplash access key not found");
  }

  const query = generateSearchQuery(placeName, category);

  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&w=400&h=300&client_id=${accessKey}`
  );

  if (!response.ok) {
    throw new Error(`Unsplash API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.urls && data.urls.regular) {
    return { url: data.urls.regular };
  }

  throw new Error("No image found in Unsplash");
};

/**
 * Pexels API implementation
 */
const getPexelsImage = async (
  placeName: string,
  category: string
): Promise<{ url: string }> => {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error("Pexels API key not found");
  }

  const query = generateSearchQuery(placeName, category);

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.photos && data.photos.length > 0) {
    return { url: data.photos[0].src.medium };
  }

  throw new Error("No image found in Pexels");
};

/**
 * Picsum (Lorem Picsum) implementation - reliable fallback
 */
const getPicsumImage = (
  width: number,
  height: number,
  seed: string
): { url: string } => {
  const seedNumber = hashCode(seed) % 1000;
  return {
    url: `https://picsum.photos/seed/${seedNumber}/${width}/${height}?blur=0&grayscale=0`,
  };
};

/**
 * Simple hash function to generate consistent seeds
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return Math.abs(hash);
};

/**
 * Generate search query based on place name and category
 */
const generateSearchQuery = (placeName: string, category: string): string => {
  const categoryMap: Record<string, string[]> = {
    hotel: ["hotel", "accommodation", "resort"],
    restaurant: ["restaurant", "dining", "food"],
    attraction: ["landmark", "tourist attraction", "monument"],
    food: ["food", "cuisine", "dish"],
    general: ["travel", "destination", "place"],
  };

  const keywords = categoryMap[category] || categoryMap.general;
  return `${placeName} ${keywords[0]}`;
};

/**
 * Generate placeholder image URL using a placeholder service
 */
const generatePlaceholderImage = (
  placeName: string,
  category: string,
  width: number,
  height: number
): string => {
  const categoryEmojis: Record<string, string> = {
    hotel: "🏨",
    restaurant: "🍽️",
    attraction: "📍",
    food: "🍽️",
    general: "📍",
  };

  const emoji = categoryEmojis[category] || "📍";
  const text = encodeURIComponent(`${emoji} ${placeName}`);

  return `https://via.placeholder.com/${width}x${height}/e2e8f0/64748b?text=${text}`;
};

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
