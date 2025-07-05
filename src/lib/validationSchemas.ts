import { z } from "zod";
export const tripFormSchema = z
  .object({
    currentLocation: z.string().min(1, "Please select your current location"),
    destination: z.string().min(1, "Please select a destination"),
    startDate: z.date({
      required_error: "Please select a start date",
      invalid_type_error: "Please select a valid date",
    }),
    days: z
      .number()
      .min(1, "Trip must be at least 1 day")
      .max(365, "Trip cannot exceed 365 days"),
    budget: z.string().min(1, "Please select a budget option"),
    traveler: z.string().min(1, "Please select traveler type"),
  })
  .refine(
    (data) => {
      const predefinedBudgets = [
        "$0 - $1000",
        "$1000 - $2500",
        "$2500 and above",
      ];
      if (!predefinedBudgets.includes(data.budget)) {
        return !isNaN(Number(data.budget)) && Number(data.budget) > 0;
      }
      return true;
    },
    {
      message: "Please enter a valid custom budget amount",
      path: ["budget"],
    }
  )
  .refine(
    (data) => {
      const predefinedTravelers = [
        "1 Person(solo)",
        "2 People(couple)",
        "3 to 5 People(family)",
        "4 to 10 People(friends)",
      ];
      if (!predefinedTravelers.includes(data.traveler)) {
        const match = data.traveler.match(/^(\d+) people \(group\)$/);
        return match && !isNaN(Number(match[1])) && Number(match[1]) > 0;
      }
      return true;
    },
    {
      message: "Please enter a valid number of travelers",
      path: ["traveler"],
    }
  );
export type TripFormData = z.infer<typeof tripFormSchema>;
