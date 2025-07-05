import { z } from "zod";

// Validation schema for trip creation form
export const tripFormSchema = z
  .object({
    destination: z.string().min(1, "Please select a destination"),
    days: z
      .number()
      .min(1, "Trip must be at least 1 day")
      .max(365, "Trip cannot exceed 365 days"),
    budget: z.string().min(1, "Please select a budget option"),
    customBudget: z.string().optional(),
    traveler: z.string().min(1, "Please select traveler type"),
    customTravelerCount: z.string().optional(),
  })
  .refine(
    (data) => {
      // If budget is "other", customBudget must be provided and be a valid number
      if (data.budget === "other") {
        return (
          data.customBudget &&
          !isNaN(Number(data.customBudget)) &&
          Number(data.customBudget) > 0
        );
      }
      return true;
    },
    {
      message: "Please enter a valid custom budget amount",
      path: ["customBudget"],
    }
  )
  .refine(
    (data) => {
      // If traveler is "other", customTravelerCount must be provided and be a valid number
      if (data.traveler === "other") {
        return (
          data.customTravelerCount &&
          !isNaN(Number(data.customTravelerCount)) &&
          Number(data.customTravelerCount) > 0
        );
      }
      return true;
    },
    {
      message: "Please enter a valid number of travelers",
      path: ["customTravelerCount"],
    }
  );

// Type inference from the schema
export type TripFormData = z.infer<typeof tripFormSchema>;
