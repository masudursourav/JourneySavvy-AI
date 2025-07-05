import { Loader } from "@googlemaps/js-api-loader";

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (): Promise<void> => {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader
      .load()
      .then(() => {
        isLoaded = true;
        console.log("Google Maps API loaded successfully");
        resolve();
      })
      .catch((error: Error) => {
        console.error("Error loading Google Maps API:", error);
        reject(error);
      });
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded;
};
