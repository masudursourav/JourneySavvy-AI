export interface TripDetails {
  destination: string;
  origin: string;
  startDate: string;
  duration: string;
  budget: {
    currency: string;
    range: string;
    perPerson: string;
  };
  travelers: {
    adults: number;
    travelerType: string;
  };
}

export interface Flight {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  estimatedCost: number;
  duration: string;
  stops: number;
}

export interface Transportation {
  flights: {
    availableFlights: Flight[];
    flightAlternatives: Flight[];
    alternativeTransportation: string;
  };
  notes: string;
}

export interface DailyForecast {
  date: string;
  condition: string;
  temperature: {
    high: number;
    low: number;
  };
}

export interface Weather {
  generalForecast: string;
  dailyForecast: DailyForecast[];
  recommendations: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HotelOption {
  name: string;
  address: string;
  imageUrl: string;
  coordinates: Coordinates;
  rating: number;
  description: string;
  pricePerNight: number;
}

export interface Accommodation {
  hotelOptions: HotelOption[];
  accommodationNotes: string;
}

export interface Activity {
  placeName: string;
  placeDetails: string;
  imageUrl: string | null;
  coordinates: Coordinates | null;
  ticketPrice: number | null;
  rating: number | null;
  notes?: string;
}

export interface DayItinerary {
  date: string;
  activities: Activity[];
}

export interface Itinerary {
  day1: DayItinerary;
  day2: DayItinerary;
  day3: DayItinerary;
  day4: DayItinerary;
  day5: DayItinerary;
  [key: string]: DayItinerary; // For dynamic day keys
}

export interface UniqueActivity {
  name: string;
  description: string;
  priceRange: string;
}

export interface Food {
  name: string;
  details: string;
  imageUrl: string;
}

export interface TraditionalFoods {
  foods: Food[];
  foodNotes: string;
}

export interface UsefulUrl {
  name: string;
  url: string;
}

export interface TravelResources {
  usefulUrls: UsefulUrl[];
  visaRequirements: string;
  health: string;
  safetyTips: string;
}

// Main trip response interface
export interface TripResponse {
  tripDetails: TripDetails;
  transportation: Transportation;
  weather: Weather;
  accommodation: Accommodation;
  itinerary: Itinerary;
  uniqueActivities: UniqueActivity[];
  traditionalFoods: TraditionalFoods;
  travelResources: TravelResources;
}
