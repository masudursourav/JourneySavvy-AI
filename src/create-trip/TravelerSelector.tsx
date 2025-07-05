import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { travelerListOptions } from "@/lib/Options";
import { Users } from "lucide-react";
import { useState } from "react";

interface TravelerSelectorProps {
  selectedTraveler: string | null;
  onTravelerSelect: (traveler: string) => void;
}

function TravelerSelector({
  selectedTraveler,
  onTravelerSelect,
}: TravelerSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const isCustomTraveler =
    selectedTraveler &&
    !travelerListOptions.find((option) => option.value === selectedTraveler);
  const customTravelerCount = isCustomTraveler ? selectedTraveler : "";

  const handleTravelerClick = (value: string) => {
    if (value === "other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      if (selectedTraveler === value) {
        onTravelerSelect("");
      } else {
        onTravelerSelect(value);
      }
    }
  };

  const handleCustomTravelerChange = (value: string) => {
    onTravelerSelect(value + " people (group)");
  };

  return (
    <div className="max-w-4xl mt-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        Who do you plan on traveling with on your next adventure?{" "}
        <Users className="inline-block h-6 w-6 ml-2" />
      </h3>
      <p className="text-gray-600 mb-8">
        Choose your travel companion type to help us tailor the perfect
        experience for your group size and travel style.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {travelerListOptions.map((option) => (
          <div
            key={option.value}
            className={`p-6 border rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer ${
              selectedTraveler === option.value
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleTravelerClick(option.value)}
          >
            <div className="flex-1">
              <div className="text-3xl mb-4">{option.icon}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {option.label}
              </h4>
              <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                {option.desc}
              </p>
              <p className="text-gray-500 text-sm font-medium">
                {option.people}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant={
                  selectedTraveler === option.value ? "default" : "outline"
                }
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTravelerClick(option.value);
                }}
              >
                {selectedTraveler === option.value ? "Selected" : "Select"}
              </Button>
            </div>
          </div>
        ))}

        {/* Other Option */}
        <div
          className={`p-6 border rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer ${
            isCustomTraveler
              ? "border-blue-500 bg-blue-50 shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleTravelerClick("other")}
        >
          <div className="flex-1">
            <div className="text-3xl mb-4">👥</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Other</h4>
            <p className="text-gray-600 mb-2 text-sm leading-relaxed">
              Enter custom number of travelers
            </p>
            {showCustomInput && (
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Number of people"
                  value={customTravelerCount.replace(" people (group)", "")}
                  onChange={(e) => handleCustomTravelerChange(e.target.value)}
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant={isCustomTraveler ? "default" : "outline"}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleTravelerClick("other");
              }}
            >
              {isCustomTraveler ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelerSelector;
