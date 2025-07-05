import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef } from "react";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onClearPlace?: () => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

function PlacesAutocomplete({
  onPlaceSelect,
  onClearPlace,
  placeholder = "Search for a destination...",
  className = "",
  debounceMs = 300,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedHandleInputChange = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (value.length < 3) {
          onClearPlace?.();
        }
      }, debounceMs);
    },
    [onClearPlace, debounceMs]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !window.google) return;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["(cities)"],
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "types",
        "address_components",
      ],
    });

    autocomplete.setOptions({
      strictBounds: false,
      types: ["(cities)"],
    });

    autocompleteRef.current = autocomplete;

    const placeChangedListener = autocomplete.addListener(
      "place_changed",
      () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry) {
          console.warn("No place geometry available");
          return;
        }
        onPlaceSelect(place);
      }
    );

    const handleInputChange = () => {
      const currentValue = input.value.trim();
      debouncedHandleInputChange(currentValue);
    };

    input.addEventListener("input", handleInputChange);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        setTimeout(handleInputChange, 0);
      }
    });
    return () => {
      if (placeChangedListener) {
        google.maps.event.removeListener(placeChangedListener);
      }
      input.removeEventListener("input", handleInputChange);
      input.removeEventListener("keydown", handleInputChange);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      autocompleteRef.current = null;
    };
  }, [onPlaceSelect, onClearPlace, debouncedHandleInputChange]);

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      className={`py-6 ${className}`}
    />
  );
}

export default PlacesAutocomplete;
