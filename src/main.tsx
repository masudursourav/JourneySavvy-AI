import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import Header from "./components/custom/Header.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import TripCreator from "./create-trip/TripCreator.tsx";
import "./index.css";
import MyTrips from "./my-trips/MyTrips.tsx";
import ViewTrip from "./view-trip/[tripId]/ViewTrip.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/create-trip" element={<TripCreator />} />
          <Route
            path="/my-trips"
            element={
              <PrivateRoute>
                <MyTrips />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-trip/:tripId"
            element={
              <PrivateRoute>
                <ViewTrip />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
