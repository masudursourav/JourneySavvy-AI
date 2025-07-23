interface ImageResult {
  url: string;
  source: "google" | "pexels" | "unsplash" | "picsum" | "placeholder";
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
const failedUrls = new Set<string>();
export const getPlaceImage = async (
  options: PlaceImageOptions,
  retryCount: number = 0
): Promise<ImageResult> => {
  const {
    placeName,
    address = "",
    category = "general",
    width = 400,
    height = 300,
  } = options;
  const cacheKey = `${placeName}-${address}-${category}-${width}x${height}-retry${retryCount}`;

  if (retryCount === 0 && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const imageSources = [
    { name: "Pexels", fn: () => getPexelsImage(placeName, category) },
    {
      name: "Google Places",
      fn: () => getGooglePlaceImage(placeName, address, width, height),
    },
    { name: "Unsplash", fn: () => getUnsplashImage(placeName, category) },
    { name: "Picsum", fn: () => getPicsumImage(width, height, placeName) },
  ];

  for (const [index, source] of imageSources.entries()) {
    try {
      const result = await source.fn();
      if (result.url) {
        const sourceNames = ["pexels", "google", "unsplash", "picsum"] as const;
        const imageResult: ImageResult = {
          url: result.url,
          source: sourceNames[index],
          isDefault: false,
        };
        imageCache.set(cacheKey, imageResult);
        return imageResult;
      }
    } catch {
      continue;
    }
  }

  const placeholderResult: ImageResult = {
    url: generateStyledPlaceholder(placeName, category, width, height),
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
  };

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos.name",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API request failed: ${response.status} - ${errorText}`
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
    )}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pexels API request failed: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  if (data.photos && data.photos.length > 0) {
    const photoUrl = data.photos[0].src.medium;
    return { url: photoUrl };
  }

  throw new Error("No image found in Pexels");
};

/**
 * Unsplash API implementation
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
    )}&w=400&h=300&orientation=landscape&client_id=${accessKey}`
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
 * Picsum (Lorem Picsum) implementation - reliable fallback that doesn't require API keys
 */
const getPicsumImage = (
  width: number,
  height: number,
  seed: string
): { url: string } => {
  const seedNumber = hashCode(seed) % 1000;
  const url = `https://picsum.photos/seed/${seedNumber}/${width}/${height}?blur=0&grayscale=0`;
  return { url };
};

/**
 * Generate search query based on place name and category
 */
const generateSearchQuery = (placeName: string, category: string): string => {
  const categoryMap: Record<string, string[]> = {
    hotel: ["hotel", "accommodation", "resort", "luxury hotel"],
    restaurant: ["restaurant", "dining", "food", "cuisine"],
    attraction: ["landmark", "tourist attraction", "monument", "sightseeing"],
    food: ["food", "cuisine", "dish", "traditional food"],
    general: ["travel", "destination", "place", "city"],
  };

  const keywords = categoryMap[category] || categoryMap.general;
  return `${placeName} ${keywords[0]}`;
};

/**
 * Simple hash function to generate consistent seeds
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

/**
 * Generate styled placeholder with category-specific colors and icons
 */
const generateStyledPlaceholder = (
  placeName: string,
  category: string,
  width: number,
  height: number
): string => {
  const categoryStyles: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    hotel: { bg: "3b82f6", text: "ffffff", icon: "🏨" },
    restaurant: { bg: "ef4444", text: "ffffff", icon: "🍽️" },
    attraction: { bg: "10b981", text: "ffffff", icon: "📍" },
    food: { bg: "f59e0b", text: "ffffff", icon: "🍽️" },
    general: { bg: "6b7280", text: "ffffff", icon: "🌍" },
  };

  const style = categoryStyles[category] || categoryStyles.general;
  const cleanName = placeName.slice(0, 15);
  const text = encodeURIComponent(`${style.icon} ${cleanName}`);

  return `https://via.placeholder.com/${width}x${height}/${style.bg}/${style.text}?text=${text}`;
};

/**
 * Specialized functions for different types of places
 */
export const getHotelImage = async (
  hotelName: string,
  address: string,
  retryCount: number = 0
): Promise<ImageResult> => {
  return getPlaceImage(
    {
      placeName: hotelName,
      address,
      category: "hotel",
      width: 400,
      height: 300,
    },
    retryCount
  );
};

export const getAttractionImage = async (
  attractionName: string,
  city?: string,
  retryCount: number = 0
): Promise<ImageResult> => {
  return getPlaceImage(
    {
      placeName: attractionName,
      address: city || "",
      category: "attraction",
      width: 400,
      height: 200,
    },
    retryCount
  );
};

export const getFoodImage = async (
  foodName: string,
  location?: string,
  retryCount: number = 0
): Promise<ImageResult> => {
  return getPlaceImage(
    {
      placeName: foodName,
      address: location || "",
      category: "food",
      width: 300,
      height: 200,
    },
    retryCount
  );
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
 * Cache management functions
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  failedUrls.clear();
};

export const markUrlAsFailed = (url: string): void => {
  failedUrls.add(url);
};

export const getImageCacheSize = (): number => {
  return imageCache.size;
};

export const getImageCacheStats = () => {
  const stats: Record<string, number> = {};
  for (const [, result] of imageCache) {
    stats[result.source] = (stats[result.source] || 0) + 1;
  }
  return stats;
};

export const getHotelPhoto = getHotelImage;
export const getAttractionPhoto = getAttractionImage;
export const getFoodPhoto = getFoodImage;
