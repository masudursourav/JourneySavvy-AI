/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GOOGLE_AUTH_CLIENT_ID: string;

  readonly VITE_PEXELS_API_KEY: string;
  readonly VITE_UNSPLASH_ACCESS_KEY: string;

  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
