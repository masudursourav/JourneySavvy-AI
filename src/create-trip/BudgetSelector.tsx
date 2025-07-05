import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { budgetOptions } from "@/lib/Options";
import { PiggyBank } from "lucide-react";
import { useState } from "react";

interface BudgetSelectorProps {
  selectedBudget: string | null;
  onBudgetSelect: (budget: string) => void;
}

function BudgetSelector({
  selectedBudget,
  onBudgetSelect,
}: BudgetSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const isCustomBudget =
    selectedBudget &&
    !budgetOptions.find((option) => option.value === selectedBudget);
  const customBudget = isCustomBudget ? selectedBudget : "";

  const handleBudgetClick = (value: string) => {
    if (value === "other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      if (selectedBudget === value) {
        onBudgetSelect("");
      } else {
        onBudgetSelect(value);
      }
    }
  };

  const handleCustomBudgetChange = (value: string) => {
    onBudgetSelect(value);
  };
  return (
    <div className="max-w-4xl mt-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        What is your budget for this trip?{" "}
        <PiggyBank className="inline-block h-6 w-6 ml-2 text-black" />
      </h3>
      <p className="text-gray-600 mb-8">
        Please provide your budget range for this trip. This will help us
        suggest accommodations, activities, and dining options that fit within
        your financial plan.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {budgetOptions.map((option) => (
          <div
            key={option.value}
            className={`p-6 border rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
              selectedBudget === option.value
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
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
                {option.money}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant={
                  selectedBudget === option.value ? "default" : "outline"
                }
                className="w-full"
                onClick={() => handleBudgetClick(option.value)}
              >
                {selectedBudget === option.value ? "Selected" : "Select"}
              </Button>
            </div>
          </div>
        ))}

        {/* Other Option */}
        <div
          className={`p-6 border rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
            isCustomBudget
              ? "border-blue-500 bg-blue-50 shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex-1">
            <div className="text-3xl mb-4">💰</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Other</h4>
            <p className="text-gray-600 mb-2 text-sm leading-relaxed">
              Enter your custom budget amount
            </p>
            {showCustomInput && (
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Enter amount ($)"
                  value={customBudget}
                  onChange={(e) => handleCustomBudgetChange(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant={isCustomBudget ? "default" : "outline"}
              className="w-full"
              onClick={() => handleBudgetClick("other")}
            >
              {isCustomBudget ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetSelector;
