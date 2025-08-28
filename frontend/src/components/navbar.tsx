import { LogIn, LogOut, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700/50 py-4 shadow-lg shadow-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Play className="h-10 w-10 text-red-500" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  MovieDB
                </h1>
              </div>
            </div>
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
                onClick={() => navigate("/recommendations")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse"
              >
                <Sparkles
                  className="text-yellow-300 drop-shadow-md"
                  size={20}
                />
                <span className="tracking-wide">AI Recommendation</span>
              </button>

              <SignButton />
            </nav>
            <button className="md:hidden text-white">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
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
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </button>
    </>
  );
};

export default Navbar;
