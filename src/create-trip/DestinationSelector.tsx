import PlacesAutocomplete from "../components/custom/PlacesAutocomplete";

interface DestinationSelectorProps {
  isMapLoaded: boolean;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onClearPlace?: () => void;
  selectedPlace?: google.maps.places.PlaceResult | null;
}

function DestinationSelector({
  isMapLoaded,
  onPlaceSelect,
  onClearPlace,
}: DestinationSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="max-w-2xl">
          {isMapLoaded ? (
            <div className="space-y-4">
              <PlacesAutocomplete
                onPlaceSelect={onPlaceSelect}
                onClearPlace={onClearPlace}
                placeholder="🔍 Search for your dream destination..."
                className="w-full  border-2 border-gray-100 shadow-2xl rounded-xl decoration-0 focus:outline-none"
                debounceMs={300}
              />
              <p className="text-sm text-gray-500 ml-2">
                Start typing to search for cities and countries
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">
                  Loading Google Maps...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Preparing your destination search
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DestinationSelector;
