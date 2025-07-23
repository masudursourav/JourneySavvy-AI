import {
  clearImageCache,
  getAttractionImage,
  getDestinationImage,
  getFoodImage,
  getHotelImage,
  getImageCacheSize,
  getImageCacheStats,
} from "../lib/finalImageService";

/**
 * Debug utility for testing the image service
 */
export class ImageServiceDebugger {
  /**
   * Test all image sources with sample data
   */
  static async testAllImageSources() {
    console.log("🔍 Testing Image Service...");

    const tests = [
      { name: "Hotel", fn: () => getHotelImage("Grand Hotel", "New York, NY") },
      {
        name: "Attraction",
        fn: () => getAttractionImage("Statue of Liberty", "New York"),
      },
      { name: "Food", fn: () => getFoodImage("Pizza Margherita", "Italy") },
      { name: "Destination", fn: () => getDestinationImage("Paris, France") },
    ];

    for (const test of tests) {
      try {
        console.log(`\n📸 Testing ${test.name}...`);
        const startTime = Date.now();
        const result = await test.fn();
        const duration = Date.now() - startTime;

        console.log(`✅ ${test.name} loaded successfully`);
        console.log(`   Source: ${result.source}`);
        console.log(`   URL: ${result.url.substring(0, 100)}...`);
        console.log(`   Duration: ${duration}ms`);
        console.log(`   Is Default: ${result.isDefault}`);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error);
      }
    }

    // Show cache statistics
    console.log("\n📊 Cache Statistics:");
    console.log(`   Cache size: ${getImageCacheSize()}`);
    console.log(`   Cache breakdown:`, getImageCacheStats());
  }

  /**
   * Test specific image source
   */
  static async testImageSource(
    placeName: string,
    category: "hotel" | "attraction" | "food" | "destination"
  ) {
    console.log(`🔍 Testing ${category} image for: ${placeName}`);

    try {
      let result;
      switch (category) {
        case "hotel":
          result = await getHotelImage(placeName, "");
          break;
        case "attraction":
          result = await getAttractionImage(placeName);
          break;
        case "food":
          result = await getFoodImage(placeName);
          break;
        case "destination":
          result = await getDestinationImage(placeName);
          break;
      }

      console.log("✅ Success:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed:", error);
      throw error;
    }
  }

  /**
   * Clear cache and show statistics
   */
  static clearCacheAndShowStats() {
    console.log("🗑️ Clearing image cache...");
    console.log(`   Removed ${getImageCacheSize()} cached images`);
    clearImageCache();
    console.log(`   Cache size after clear: ${getImageCacheSize()}`);
  }

  /**
   * Show current cache statistics
   */
  static showCacheStats() {
    console.log("📊 Current Cache Statistics:");
    console.log(`   Total cached images: ${getImageCacheSize()}`);
    console.log(`   Sources breakdown:`, getImageCacheStats());
  }

  /**
   * Test API key configuration
   */
  static testApiKeyConfiguration() {
    console.log("🔑 Testing API Key Configuration:");

    const configs = [
      { name: "Google Maps API", key: "VITE_GOOGLE_MAPS_API_KEY" },
      { name: "Pexels API", key: "VITE_PEXELS_API_KEY" },
      { name: "Unsplash API", key: "VITE_UNSPLASH_ACCESS_KEY" },
    ];

    configs.forEach((config) => {
      const value = import.meta.env[config.key];
      const status = value ? "✅ Configured" : "❌ Not configured";
      const preview = value ? `(${value.substring(0, 10)}...)` : "";
      console.log(`   ${config.name}: ${status} ${preview}`);
    });
  }

  /**
   * Performance test
   */
  static async performanceTest(iterations = 5) {
    console.log(`⚡ Performance Test (${iterations} iterations):`);

    const testCases = [
      () => getHotelImage("Test Hotel", "Test City"),
      () => getAttractionImage("Test Attraction"),
      () => getFoodImage("Test Food"),
    ];

    for (const [index, testCase] of testCases.entries()) {
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        try {
          await testCase();
          times.push(Date.now() - startTime);
        } catch {
          console.warn(`   Iteration ${i + 1} failed for test ${index + 1}`);
        }
      }

      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        console.log(
          `   Test ${index + 1}: avg ${avgTime.toFixed(
            2
          )}ms, min ${minTime}ms, max ${maxTime}ms`
        );
      }
    }
  }
}

// Make it available on window for browser console testing
if (typeof window !== "undefined") {
  (
    window as typeof window & {
      ImageServiceDebugger: typeof ImageServiceDebugger;
    }
  ).ImageServiceDebugger = ImageServiceDebugger;
  console.log(
    "🛠️ ImageServiceDebugger available on window.ImageServiceDebugger"
  );
  console.log("   Try: ImageServiceDebugger.testAllImageSources()");
}
