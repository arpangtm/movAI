import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Onboarding from "./pages/onboarding.tsx";
import Recommend from "./pages/recommend.tsx";
import Watchlist from "./pages/watchlist.tsx";
import Movie from "./pages/movie.tsx";

import "./index.css";

import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = "pk_test_aG9uZXN0LXdhc3AtOS5jbGVyay5hY2NvdW50cy5kZXYk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route index element={<App />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="recommend" element={<Recommend />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="/movie/:id" element={<Movie />} />
        </Routes>
      </Router>
    </ClerkProvider>
  </StrictMode>
);
