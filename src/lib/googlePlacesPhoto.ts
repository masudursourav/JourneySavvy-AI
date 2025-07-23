interface PlacePhotoOptions {
  placeName: string;
  address?: string;
  width?: number;
  height?: number;
}

interface PlacePhoto {
  url: string;
  isDefault: boolean;
}

interface GooglePlace {
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
}

interface GooglePlacesResponse {
  places?: GooglePlace[];
}

// Cache for place photos to avoid repeated API calls
const photoCache = new Map<string, PlacePhoto>();

/**
 * Get a high-quality image URL using Google Places API (New) only
 */
export const getPlacePhoto = async ({
  placeName,
  address = "",
  width = 400,
  height = 300,
}: PlacePhotoOptions): Promise<PlacePhoto> => {
  const cacheKey = `${placeName}-${address}-${width}x${height}`;

  // Return cached result if available
  if (photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey)!;
  }

  const searchQuery = `${placeName} ${address}`.trim();

  try {
    // Use Google Places API (New) to search for places
    const placesResult = await searchPlaces(searchQuery);
    if (placesResult && placesResult.photos && placesResult.photos.length > 0) {
      // Get photo URL using Places Photo API
      const photoUrl = await getPhotoUrl(
        placesResult.photos[0].name,
        width,
        height
      );
      const result: PlacePhoto = {
        url: photoUrl,
        isDefault: false,
      };
      photoCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error("Google Places API failed:", error);
  }

  // Return placeholder when Google Places fails or has no photos
  const placeholderResult: PlacePhoto = {
    url: "", // Empty URL - components should handle this
    isDefault: true,
  };
  photoCache.set(cacheKey, placeholderResult);
  return placeholderResult;
};

/**
 * Search for places using Google Places API (New)
 */
const searchPlaces = async (query: string): Promise<GooglePlace | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key not found");
  }

  const requestBody = {
    textQuery: query,
    maxResultCount: 1,
    includedType: "establishment",
  };

  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
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

  const data: GooglePlacesResponse = await response.json();

  if (data.places && data.places.length > 0) {
    return data.places[0];
  }

  return null;
};

/**
 * Get photo URL from Google Places Photo API
 */
const getPhotoUrl = async (
  photoName: string,
  width: number,
  height: number
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Use the photo name directly in the API call
  return `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=${height}&maxWidthPx=${width}`;
};

/**
 * Get hotel photo using Google Places API
 */
export const getHotelPhoto = async (
  hotelName: string,
  address: string
): Promise<PlacePhoto> => {
  return getPlacePhoto({
    placeName: `${hotelName}`,
    address,
    width: 400,
    height: 300,
  });
};

/**
 * Get activity/attraction photo using Google Places API
 */
export const getAttractionPhoto = async (
  attractionName: string,
  city?: string
): Promise<PlacePhoto> => {
  return getPlacePhoto({
    placeName: attractionName,
    address: city || "",
    width: 400,
    height: 200,
  });
};

/**
 * Get restaurant/food photo using Google Places API
 */
export const getFoodPhoto = async (
  foodName: string,
  location?: string
): Promise<PlacePhoto> => {
  return getPlacePhoto({
    placeName: `${foodName} restaurant`,
    address: location || "",
    width: 300,
    height: 200,
  });
};

/**
 * Clear photo cache
 */
export const clearPhotoCache = (): void => {
  photoCache.clear();
};
