import { Button } from "@/components/ui/button";
import { Edit3, Navigation, X } from "lucide-react";
import { useState } from "react";
import PlacesAutocomplete from "../components/custom/PlacesAutocomplete";

interface CurrentLocationSelectorProps {
  isMapLoaded: boolean;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onClearPlace?: () => void;
  selectedPlace: google.maps.places.PlaceResult | null;
}

function CurrentLocationSelector({
  isMapLoaded,
  onPlaceSelect,
  onClearPlace,
  selectedPlace,
}: CurrentLocationSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGpsLocation, setIsGpsLocation] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          if (!window.google) {
            throw new Error("Google Maps API not loaded");
          }

          const geocoder = new google.maps.Geocoder();
          const latLng = new google.maps.LatLng(latitude, longitude);

          geocoder.geocode({ location: latLng }, (results, status) => {
            setIsDetecting(false);

            if (status === "OK" && results && results[0]) {
              const place = results[0];
              let cityName = "";
              let countryName = "";

              if (place.address_components) {
                for (const component of place.address_components) {
                  if (component.types.includes("locality")) {
                    cityName = component.long_name;
                  } else if (
                    component.types.includes("administrative_area_level_1")
                  ) {
                    if (!cityName) {
                      cityName = component.long_name;
                    }
                  } else if (component.types.includes("country")) {
                    countryName = component.long_name;
                  }
                }
              }
              const displayName = cityName
                ? `${cityName}${countryName ? `, ${countryName}` : ""}`
                : place.formatted_address;
              const placeResult: google.maps.places.PlaceResult = {
                place_id: place.place_id,
                name: displayName,
                formatted_address: place.formatted_address,
                geometry: place.geometry,
                types: place.types,
                address_components: place.address_components,
              };

              console.log("Detected location:", displayName);
              setIsGpsLocation(true);
              setShowManualEntry(false);
              onPlaceSelect(placeResult);
            } else {
              alert(
                "Unable to determine your current location. Please select manually."
              );
            }
          });
        } catch (error) {
          setIsDetecting(false);
          console.error("Error getting current location:", error);
          alert("Error detecting location. Please select manually.");
        }
      },
      (error) => {
        setIsDetecting(false);
        console.error("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location access denied. Please select your location manually."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable. Please select manually.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Please select manually.");
            break;
          default:
            alert("Unknown error occurred. Please select manually.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const toggleToManualEntry = () => {
    setShowManualEntry(true);
    setIsGpsLocation(false);
  };

  const handleManualPlaceSelect = (place: google.maps.places.PlaceResult) => {
    setIsGpsLocation(false);
    setShowManualEntry(false);
    onPlaceSelect(place);
  };

  const handleClearLocation = () => {
    setIsGpsLocation(false);
    setShowManualEntry(false);
    if (onClearPlace) {
      onClearPlace();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="max-w-2xl">
          {isMapLoaded ? (
            <div className="space-y-4">
              {/* Show GPS detected location without input */}
              {isGpsLocation && selectedPlace && !showManualEntry ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Navigation className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                          GPS Location Detected
                        </p>
                        <p className="text-blue-800 font-bold text-lg">
                          {selectedPlace.name ||
                            selectedPlace.formatted_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={toggleToManualEntry}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        onClick={handleClearLocation}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Show manual entry form */
                <div className="space-y-4">
                  <div className="flex gap-4 justify-center items-center">
                    <div className="flex-1">
                      <PlacesAutocomplete
                        onPlaceSelect={handleManualPlaceSelect}
                        onClearPlace={onClearPlace}
                        placeholder="🏠 Search for your current location..."
                        className="w-full border-2 border-gray-100 shadow-2xl rounded-xl decoration-0 focus:outline-none"
                        debounceMs={300}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={isDetecting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      title="Detect current location using GPS"
                    >
                      {isDetecting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <Navigation className="h-5 w-5" />
                          <span className="sr-only">GPS</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 ml-2">
                    Search for your city or click the 📍 GPS button to
                    automatically detect your current location
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">
                  Loading Google Maps...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Preparing location detection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentLocationSelector;
