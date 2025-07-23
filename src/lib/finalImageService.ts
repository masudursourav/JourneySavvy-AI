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

// Cache for images to avoid repeated API calls
const imageCache = new Map<string, ImageResult>();
// Track failed URLs to avoid retrying them
const failedUrls = new Set<string>();

/**
 * Robust image service with multiple fallback sources
 */
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

  // Return cached result if available (but not for retries)
  if (retryCount === 0 && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Debug logging
  console.log(
    `🔍 Loading image for: ${placeName} (${category}) - attempt ${
      retryCount + 1
    }`
  );

  // Try each image source in order of preference
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
      console.log(`📡 Trying ${source.name} for ${placeName}...`);
      const result = await source.fn();
      if (result.url) {
        const sourceNames = ["pexels", "google", "unsplash", "picsum"] as const;
        const imageResult: ImageResult = {
          url: result.url,
          source: sourceNames[index],
          isDefault: false,
        };
        console.log(
          `✅ ${source.name} succeeded for ${placeName}: ${result.url}`
        );
        imageCache.set(cacheKey, imageResult);
        return imageResult;
      }
    } catch (error) {
      console.warn(`❌ ${source.name} failed for ${placeName}:`, error);
      continue;
    }
  }

  // Final fallback to styled placeholder
  console.log(`🎨 Using styled placeholder for ${placeName}`);
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
  console.log(`🔍 Google Places search query: ${searchQuery}`);

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

  console.log(`📡 Google Places API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Google Places API error:`, errorText);
    throw new Error(
      `Google Places API request failed: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log(`📊 Google Places API data:`, data);

  if (
    data.places &&
    data.places.length > 0 &&
    data.places[0].photos &&
    data.places[0].photos.length > 0
  ) {
    const photoName = data.places[0].photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=${height}&maxWidthPx=${width}`;
    console.log(`✅ Google Places photo found: ${photoUrl}`);
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

  console.log(`🔑 Pexels API key available: ${!!apiKey}`);

  if (!apiKey) {
    throw new Error("Pexels API key not found");
  }

  const query = generateSearchQuery(placeName, category);
  console.log(`🔍 Pexels search query: ${query}`);

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

  console.log(`📡 Pexels API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Pexels API error:`, errorText);
    throw new Error(
      `Pexels API request failed: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log(`📊 Pexels API data:`, data);

  if (data.photos && data.photos.length > 0) {
    const photoUrl = data.photos[0].src.medium;
    console.log(`✅ Pexels photo found: ${photoUrl}`);
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
  // Generate a consistent seed based on the place name
  const seedNumber = hashCode(seed) % 1000;
  const url = `https://picsum.photos/seed/${seedNumber}/${width}/${height}?blur=0&grayscale=0`;
  console.log(`🎨 Generated Picsum URL: ${url}`);
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
    hash = hash & hash; // Convert to 32bit integer
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
  const cleanName = placeName.slice(0, 15); // Limit text length for readability
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

// Legacy compatibility functions
export const getHotelPhoto = getHotelImage;
export const getAttractionPhoto = getAttractionImage;
export const getFoodPhoto = getFoodImage;
