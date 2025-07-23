import {
  getAttractionImage,
  getFoodImage,
  getHotelImage,
} from "@/lib/finalImageService";
import { useEffect, useState } from "react";

interface ImageResult {
  url: string;
  source: string;
  isDefault: boolean;
}

interface TestResult {
  name: string;
  fn: () => Promise<ImageResult>;
  result?: ImageResult;
  error?: string;
  success: boolean;
}

const ImageTestComponent = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testImages = async () => {
      const tests = [
        {
          name: "Hotel Test",
          fn: () => getHotelImage("Grand Hotel", "New York"),
        },
        {
          name: "Attraction Test",
          fn: () => getAttractionImage("Eiffel Tower"),
        },
        { name: "Food Test", fn: () => getFoodImage("Pizza") },
      ];

      const results: TestResult[] = [];
      for (const test of tests) {
        try {
          console.log(`Testing ${test.name}...`);
          const result = await test.fn();
          console.log(`${test.name} result:`, result);
          results.push({ ...test, result, success: true });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`${test.name} failed:`, error);
          results.push({ ...test, error: errorMessage, success: false });
        }
      }

      setTestResults(results);
      setLoading(false);
    };

    testImages();
  }, []);

  if (loading) {
    return <div className="p-4">Testing image service...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Image Service Test Results</h2>
      {testResults.map((test, index) => (
        <div key={index} className="border p-4 rounded">
          <h3 className="font-semibold">{test.name}</h3>
          {test.success && test.result ? (
            <div>
              <p className="text-green-600">✅ Success</p>
              <p>Source: {test.result.source}</p>
              <p>URL: {test.result.url.substring(0, 100)}...</p>
              <img
                src={test.result.url}
                alt={test.name}
                className="w-48 h-32 object-cover mt-2"
                onError={() =>
                  console.error(`Image failed to load: ${test.result?.url}`)
                }
              />
            </div>
          ) : (
            <div>
              <p className="text-red-600">❌ Failed</p>
              <p>Error: {test.error}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageTestComponent;
