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

  // Debounced function for handling input changes
  const debouncedHandleInputChange = useCallback(
    (value: string) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        console.log("Debounced input value changed:", value);

        // If input is empty or very short, clear the selected place
        if (value.length < 3) {
          console.log("Input cleared or too short, clearing place");
          onClearPlace?.();
        }
      }, debounceMs);
    },
    [onClearPlace, debounceMs]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !window.google) return;

    console.log("Setting up autocomplete with classic Autocomplete API");

    // Create the classic Autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["(cities)"], // Only show cities, localities, and administrative areas
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "types",
        "address_components",
      ],
    });

    // Set additional options for better geographic filtering
    autocomplete.setOptions({
      strictBounds: false,
      types: ["(cities)"],
    });

    // Store the autocomplete instance
    autocompleteRef.current = autocomplete;

    // Add event listener for place selection
    const placeChangedListener = autocomplete.addListener(
      "place_changed",
      () => {
        const place = autocomplete.getPlace();
        console.log("Place changed:", place);

        if (!place || !place.geometry) {
          console.warn("No place geometry available");
          return;
        }

        console.log("Valid place selected:", place);
        onPlaceSelect(place);
      }
    );

    // Add input event listener to detect clearing with debouncing
    const handleInputChange = () => {
      const currentValue = input.value.trim();
      console.log("Input value changed:", currentValue);

      // Use debounced function to handle input changes
      debouncedHandleInputChange(currentValue);
    };

    // Add event listeners for input changes
    input.addEventListener("input", handleInputChange);
    input.addEventListener("keydown", (e) => {
      // Handle special cases like backspace, delete, etc.
      if (e.key === "Backspace" || e.key === "Delete") {
        setTimeout(handleInputChange, 0); // Check after the key event
      }
    });

    // Cleanup
    return () => {
      if (placeChangedListener) {
        google.maps.event.removeListener(placeChangedListener);
      }
      input.removeEventListener("input", handleInputChange);
      input.removeEventListener("keydown", handleInputChange);

      // Clear any pending debounce timeout
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
