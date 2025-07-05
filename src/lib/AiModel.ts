import { GoogleGenAI } from "@google/genai";
import type { TripFormData } from "./validationSchemas";

export async function travelPlanner(formData: TripFormData) {
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });
  const config = {
    responseMimeType: "text/plain",
  };
  const model = "gemini-2.0-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a travel planner AI. Your task is to generate a detailed travel plan based on user input. Provide information about flights, weather, accommodation, itinerary, unique activities, traditional foods, and useful travel resources in JSON format without any additional text.

            Generate Travel plane for: from Dhaka to bangkok thailand, for 5 days,total budget is 500-1000 $, travelers  2 person (couple), and the start date is "2025-07-08T18:00:00Z"

        in output will give me number of flight available in that route, and also alternative to go to that destination. what will be the weather of those days. Hotel options, Hotel name, hotel address, proper hotel image url, geo coordinates, rating, description. Suggest itinerary with places, place details, proper place image url, Geo coordinates, ticket price if available, rating. Unique activities they can do those days and Suggest traditional foods with food name, food details, proper food image url. Plan the trip as best as possible and give text based suggestions also. Give useful urls for travels. In JSON format without any additional text`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `\`\`\`json
{
  "tripDetails": {
    "destination": "Bangkok, Thailand",
    "origin": "Dhaka, Bangladesh",
    "startDate": "2025-07-08T18:00:00Z",
    "duration": "5 days",
    "budget": {
      "currency": "USD",
      "range": "500-1000",
      "perPerson": "250-500"
    },
    "travelers": {
      "adults": 2,
      "travelerType": "Couple"
    }
  },
  "transportation": {
    "flights": {
      "availableFlights": [
        {
          "airline": "Thai Airways",
          "flightNumber": "TG322",
          "departureAirport": "DAC",
          "arrivalAirport": "BKK",
          "departureTime": "2025-07-09T09:00:00Z",
          "arrivalTime": "2025-07-09T12:00:00Z",
          "estimatedCost": 250,
          "duration": "3 hours",
          "stops": 0
        },
        {
          "airline": "Biman Bangladesh Airlines",
          "flightNumber": "BG088",
          "departureAirport": "DAC",
          "arrivalAirport": "BKK",
          "departureTime": "2025-07-09T14:00:00Z",
          "arrivalTime": "2025-07-09T17:00:00Z",
          "estimatedCost": 220,
          "duration": "3 hours",
          "stops": 0
        }
      ],
      "flightAlternatives": [
        {
          "airline": "AirAsia",
          "flightNumber": "AK70",
          "departureAirport": "DAC",
          "arrivalAirport": "DMK",
          "departureTime": "2025-07-09T07:30:00Z",
          "arrivalTime": "2025-07-09T10:30:00Z",
          "estimatedCost": 200,
          "duration": "3 hours",
          "stops": 0
        }
      ],
      "alternativeTransportation": "No other practical alternatives (train, bus, or ship) exist for this route due to the distance."
    },
     "notes": "Book flights in advance for better prices. Consider flying into Don Mueang International Airport (DMK) for potentially cheaper flights."
  },
  "weather": {
    "generalForecast": "Bangkok in July is hot and humid with frequent rain showers. Expect temperatures between 25°C (77°F) and 33°C (91°F).",
    "dailyForecast": [
      {
        "date": "2025-07-09",
        "condition": "Scattered thunderstorms",
        "temperature": {
          "high": 32,
          "low": 26
        }
      },
      {
        "date": "2025-07-10",
        "condition": "Rain",
        "temperature": {
          "high": 31,
          "low": 25
        }
      },
      {
        "date": "2025-07-11",
        "condition": "Partly Cloudy",
        "temperature": {
          "high": 33,
          "low": 27
        }
      },
      {
        "date": "2025-07-12",
        "condition": "Scattered thunderstorms",
        "temperature": {
          "high": 32,
          "low": 26
        }
      },
      {
        "date": "2025-07-13",
        "condition": "Rain",
        "temperature": {
          "high": 30,
          "low": 25
        }
      }
    ],
    "recommendations": "Pack light, breathable clothing, an umbrella or raincoat, and sunscreen. Stay hydrated."
  },
  "accommodation": {
    "hotelOptions": [
      {
        "name": "ibis Styles Bangkok Sukhumvit Phra Khanong",
        "address": "999/9 Sukhumvit 71 Rd, Khlong Tan Nuea, Watthana, Bangkok 10110, Thailand",
        "imageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/a0/c1/0a/ibis-styles-bangkok.jpg?w=700&h=-1&s=1",
        "coordinates": {
          "latitude": 13.7177,
          "longitude": 100.5928
        },
        "rating": 4.0,
        "description": "A modern hotel in a vibrant neighborhood, offering comfortable rooms and convenient access to public transportation.",
        "pricePerNight": 40
      },
      {
        "name": "Siamaze Hostel",
        "address": "40/6 Soi Rong Mai, Trok Rong Mai 2, Rongmuang, Pathumwan, Bangkok 10330, Thailand",
        "imageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-s/0e/51/59/90/siamaze-hostel.jpg",
        "coordinates": {
          "latitude": 13.7464,
          "longitude": 100.5209
        },
        "rating": 4.5,
        "description": "A budget-friendly hostel with a social atmosphere, offering dorms and private rooms.",
        "pricePerNight": 20
      },
            {
        "name": "The Grand Fourwings Convention Hotel Bangkok",
        "address": "333 Srinagarindra Road, Hua Mak, Bangkapi, Bangkok, 10240, Thailand",
        "imageUrl": "https://pix6.agoda.net/hotelImages/371/37181/37181_17010414410049635280.jpg?ca=6&ce=1&s=1024x768",
        "coordinates": {
          "latitude": 13.7558,
          "longitude": 100.6471
        },
        "rating": 4.3,
        "description": "A luxurious hotel with top-notch facilities, near to shopping centers.",
        "pricePerNight": 70
      }
    ],
    "accommodationNotes": "Book accommodation in advance, especially during peak season. Consider staying near a BTS Skytrain or MRT Subway station for easy access to attractions."
  },
  "itinerary": {
    "day1": {
      "date": "2025-07-09",
      "activities": [
        {
          "placeName": "Wat Arun (Temple of Dawn)",
          "placeDetails": "A stunning temple on the Chao Phraya River, known for its intricate decorations and beautiful views.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Wat_Arun_at_dusk_with_no_clouds.jpg/1280px-Wat_Arun_at_dusk_with_no_clouds.jpg",
          "coordinates": {
            "latitude": 13.7445,
            "longitude": 100.4917
          },
          "ticketPrice": 50,
          "rating": 4.6
        },
        {
          "placeName": "Dinner Cruise on the Chao Phraya River",
          "placeDetails": "Enjoy a delicious Thai dinner while cruising along the river, taking in the illuminated landmarks.",
          "imageUrl": "https://www.wonderfulpackage.com/images/upload/river_star_princess_cruise_dinner_1480913141_46623.jpg",
          "coordinates": {
            "latitude": 13.7522,
            "longitude": 100.4917
          },
          "ticketPrice": 1000,
          "rating": 4.3
        }
      ]
    },
    "day2": {
      "date": "2025-07-10",
      "activities": [
        {
          "placeName": "Grand Palace & Wat Phra Kaew (Temple of the Emerald Buddha)",
          "placeDetails": "The former royal residence and home to Thailand's most sacred temple.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wat_Phra_Kaew_IMG_3792.JPG/1280px-Wat_Phra_Kaew_IMG_3792.JPG",
          "coordinates": {
            "latitude": 13.7500,
            "longitude": 100.4917
          },
          "ticketPrice": 500,
          "rating": 4.7
        },
        {
          "placeName": "Wat Pho (Reclining Buddha)",
          "placeDetails": "Home to a massive reclining Buddha statue and a renowned massage school.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Wat_Pho_Reclining_Buddha.jpg/1280px-Wat_Pho_Reclining_Buddha.jpg",
          "coordinates": {
            "latitude": 13.7467,
            "longitude": 100.4933
          },
          "ticketPrice": 200,
          "rating": 4.5
        }
      ]
    },
    "day3": {
      "date": "2025-07-11",
      "activities": [
        {
          "placeName": "Chatuchak Weekend Market",
          "placeDetails": "One of the world's largest weekend markets, offering a vast array of goods from clothing to souvenirs.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Chatuchak_Weekend_Market_%28Jatujak%29_%286108734236%29.jpg/1280px-Chatuchak_Weekend_Market_%28Jatujak%29_%286108734236%29.jpg",
          "coordinates": {
            "latitude": 13.7950,
            "longitude": 100.5483
          },
          "ticketPrice": 0,
          "rating": 4.4
        },
        {
          "placeName": "MBK Center",
          "placeDetails": "A large shopping mall with a wide selection of products and services, including electronics, clothing, and food.",
          "imageUrl": "https://www.mbk-center.co.th/upload/1655348205-0.jpg",
          "coordinates": {
            "latitude": 13.7448,
            "longitude": 100.5291
          },
          "ticketPrice": 0,
          "rating": 4.2
        }
      ]
    },
    "day4": {
      "date": "2025-07-12",
      "activities": [
        {
          "placeName": "Ayutthaya Historical Park (Day Trip)",
          "placeDetails": "Explore the ancient ruins of Ayutthaya, the former capital of Siam, a UNESCO World Heritage Site.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Wat_Yai_Chaimongkol_03.jpg/1280px-Wat_Yai_Chaimongkol_03.jpg",
          "coordinates": {
            "latitude": 14.3525,
            "longitude": 100.5667
          },
          "ticketPrice": 50,
          "rating": 4.5,
          "notes": "Travel to Ayutthaya by train or bus. Allow a full day for the trip."
        }
      ]
    },
    "day5": {
      "date": "2025-07-13",
      "activities": [
        {
          "placeName": "Lumphini Park",
          "placeDetails": "A large green space in the heart of Bangkok, perfect for relaxation and recreation.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lumphini_Park_pond.jpg/1280px-Lumphini_Park_pond.jpg",
          "coordinates": {
            "latitude": 13.7283,
            "longitude": 100.5433
          },
          "ticketPrice": 0,
          "rating": 4.4
        },
        {
          "placeName": "Jim Thompson House Museum",
          "placeDetails": "The former home of an American businessman who revitalized the Thai silk industry.",
          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Jim_Thompson_House.jpg/1280px-Jim_Thompson_House.jpg",
          "coordinates": {
            "latitude": 13.7475,
            "longitude": 100.5275
          },
          "ticketPrice": 200,
          "rating": 4.3
        },
        {
          "placeName": "Departure",
          "placeDetails": "Transfer to Suvarnabhumi Airport (BKK) or Don Mueang International Airport (DMK) for your flight back to Dhaka.",
          "imageUrl": null,
          "coordinates": null,
          "ticketPrice": null,
          "rating": null
        }
      ]
    }
  },
  "uniqueActivities": [
    {
      "name": "Thai Cooking Class",
      "description": "Learn to prepare authentic Thai dishes from a local chef. Many classes include a market tour.",
      "priceRange": "50-100 USD"
    },
    {
      "name": "Floating Markets Tour",
      "description": "Visit a traditional floating market, such as Damnoen Saduak or Amphawa, and experience the vibrant atmosphere.",
      "priceRange": "30-70 USD"
    },
    {
      "name": "Rooftop Bar Experience",
      "description": "Enjoy panoramic views of Bangkok from a rooftop bar, such as Vertigo at the Banyan Tree or Sky Bar at Lebua.",
      "priceRange": "20-50 USD (drinks)"
    },
     {
      "name": "Muay Thai Class",
      "description": "Learn some Muay Thai techniques from local trainers.",
      "priceRange": "20-50 USD"
    }
  ],
  "traditionalFoods": {
    "foods": [
      {
        "name": "Pad Thai",
        "details": "Stir-fried rice noodles with shrimp, tofu, bean sprouts, peanuts, and egg.",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Pad_Thai_with_shrimp.jpg/1280px-Pad_Thai_with_shrimp.jpg"
      },
      {
        "name": "Tom Yum Soup",
        "details": "A hot and sour soup with lemongrass, galangal, chili peppers, and lime juice.",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tom_yum_soup.jpg/1280px-Tom_yum_soup.jpg"
      },
      {
        "name": "Green Curry",
        "details": "A creamy coconut milk-based curry with green chilies, vegetables, and meat.",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Green_Chicken_Curry.jpg/1280px-Green_Chicken_Curry.jpg"
      },
      {
        "name": "Mango Sticky Rice",
        "details": "Sweet sticky rice with fresh mango slices and coconut milk.",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Mango_sticky_rice.jpg/1280px-Mango_sticky_rice.jpg"
      }
    ],
    "foodNotes": "Explore street food stalls for affordable and authentic Thai cuisine. Be cautious of spice levels and hygiene."
  },
  "travelResources": {
    "usefulUrls": [
      {
        "name": "Tourism Authority of Thailand",
        "url": "https://www.tourismthailand.org/"
      },
      {
        "name": "Bangkok Metro (MRT)",
        "url": "https://www.bangkokmetro.co.th/en"
      },
      {
        "name": "Bangkok Mass Transit System (BTS Skytrain)",
        "url": "https://www.bts.co.th/eng/index.aspx"
      },
      {
        "name": "XE Currency Converter",
        "url": "https://www.xe.com/"
      },
      {
        "name": "Agoda",
        "url": "https://www.agoda.com/"
      }
    ],
    "visaRequirements": "Citizens of many countries can enter Thailand for tourism purposes without a visa for a certain period (e.g., 30 days). Check the specific visa requirements for your nationality before traveling." ,
    "health": "Consult your doctor about necessary vaccinations and health precautions. Drink bottled water and be mindful of food hygiene.",
     "safetyTips": "Be aware of your belongings, especially in crowded areas. Avoid political demonstrations. Scams can occur; exercise caution when approached by strangers."
  }
}
\`\`\``,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `You are a travel planner AI. Your task is to generate a detailed travel plan based on user input. Provide information about flights, weather, accommodation, itinerary, unique activities, traditional foods, and useful travel resources in JSON format without any additional text.

            Generate Travel plane for: from ${formData.currentLocation} to ${
            formData.destination
          } for ${formData.days} days and total budget is ${
            formData.budget
          }$ and travelers  ${
            formData.traveler
          }, and the start date is ${formData.startDate.toISOString()}

        in output will give me number of flight available in that route, and also alternative to go to that destination. what will be the weather of those days. Hotel options, Hotel name, hotel address, proper hotel image url, geo coordinates, rating, description. Suggest itinerary with places, place details, proper place image url, Geo coordinates, ticket price if available, rating. Unique activities they can do those days and Suggest traditional foods with food name, food details, proper food image url. Plan the trip as best as possible and give text based suggestions also. Give useful urls for travels. In JSON format without any additional text`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fullResponse = "";
  for await (const chunk of response) {
    fullResponse += chunk.text;
  }
  return fullResponse;
}
