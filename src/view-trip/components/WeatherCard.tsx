import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Weather } from "@/types/tripTypes";
import { Cloud, CloudRain, CloudSnow, Sun, Thermometer } from "lucide-react";

interface WeatherCardProps {
  weather: Weather;
}

const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes("rain") || lowerCondition.includes("shower")) {
    return <CloudRain className="w-8 h-8 text-blue-500" />;
  } else if (lowerCondition.includes("snow")) {
    return <CloudSnow className="w-8 h-8 text-blue-300" />;
  } else if (lowerCondition.includes("cloud")) {
    return <Cloud className="w-8 h-8 text-gray-500" />;
  } else {
    return <Sun className="w-8 h-8 text-yellow-500" />;
  }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{weather.generalForecast}</p>

          <div className="grid gap-3">
            {weather.dailyForecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <p className="font-medium text-sm">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-600">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {day.temperature.high}°C
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {day.temperature.low}°C
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">Recommendations</h4>
            <p className="text-sm text-blue-700">{weather.recommendations}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
