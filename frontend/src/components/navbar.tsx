import { LogIn, LogOut, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RedirectToSignUp, RedirectToSignIn } from "@clerk/clerk-react";
import logo from "../../public/logos/logo.png";

import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700/50 py-4 shadow-lg shadow-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={logo}
                  alt="logo"
                  width={70}
                  height={70}
                  className="rounded-full"
                />
                <h1 className="text-3xl font-bold bg-gradient-to-r text-red-500 bg-clip-text">
                  MovieDB
                </h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-slate-300 hover:text-white transition-colors text-lg font-medium hover:scale-105 transform duration-200"
              >
                Home
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-white transition-colors text-lg font-medium hover:scale-105 transform duration-200"
              >
                Movies
              </a>
              <a
                href="/watchlist"
                className="text-slate-300 hover:text-white transition-colors text-lg font-medium hover:scale-105 transform duration-200"
              >
                Watchlist
              </a>
              <button
                onClick={() => navigate("/recommend")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse relative overflow-hidden"
                style={{
                  background: "linear-gradient(45deg, #ef4444, #dc2626)",
                  border: "3px solid transparent",
                  backgroundClip: "padding-box",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-80"
                  style={{
                    background:
                      "linear-gradient(90deg, #fbbf24, #10b981, #3b82f6, #ef4444, #fbbf24)",
                    backgroundSize: "400% 100%",
                    animation: "snake-border 5s linear infinite",
                    zIndex: -1,
                    margin: "-3px",
                  }}
                />
                <Sparkles
                  className="text-yellow-400 drop-shadow-lg relative z-10"
                  style={{
                    filter:
                      "drop-shadow(0 0 4px #fbbf24) drop-shadow(0 0 8px #f59e0b)",
                    color: "#fbbf24",
                  }}
                  size={20}
                />
                <span className="tracking-wide relative z-10">
                  AI Recommendation
                </span>

                <style jsx>{`
                  @keyframes snake-border {
                    0% {
                      background-position: 0% 50%;
                    }
                    100% {
                      background-position: 400% 50%;
                    }
                  }
                `}</style>
              </button>
              <SignButton />
            </nav>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-4">
              <SignButton />
              <button
                className="text-white focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      menuOpen
                        ? "M6 18L18 6M6 6l12 12" // X icon
                        : "M4 6h16M4 12h16M4 18h16" // Hamburger icon
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 space-y-4">
              <a
                href="#"
                className="block text-slate-300 hover:text-white text-lg font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="block text-slate-300 hover:text-white text-lg font-medium"
              >
                Movies
              </a>
              <a
                href="/watchlist"
                className="block text-slate-300 hover:text-white text-lg font-medium"
              >
                Watchlist
              </a>
              <button
                onClick={() => {
                  navigate("/recommend");
                  setMenuOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Sparkles
                  className="text-yellow-300 drop-shadow-md"
                  size={20}
                />
                <span className="tracking-wide">AI Recommendation</span>
              </button>
              {/* <SignButton /> */}
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

const SignButton = () => {
  return (
    <>
      <button className="text-white px-4 py-2 rounded-md flex items-center gap-2">
        <SignedOut>
          <SignInButton fallbackRedirectUrl="/onboarding" />
          {/* <RedirectToSignUp redirectUrl={"/onboarding"} /> */}
          {/* <RedirectToSignIn redirectUrl={"/onboarding"} /> */}
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </button>
    </>
  );
};

export default Navbar;
