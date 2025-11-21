import { Sparkles, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../public/logos/logo.png";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then(() => {
      // Token logic if needed
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <header
        className={`fixed w-full top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area */}
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer group" 
                onClick={() => navigate("/")}
              >
                <img
                  src={logo}
                  alt="logo"
                  width={50}
                  height={50}
                  className="rounded-full ring-2 ring-red-600/20 group-hover:ring-red-600/50 transition-all duration-300"
                />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Movie<span className="text-red-600">DB</span>
                </h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6 mr-4">
                <a
                  href="#"
                  className="text-zinc-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-zinc-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
                >
                  Movies
                </a>
                <a
                  href="/watchlist"
                  className="text-zinc-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
                >
                  Watchlist
                </a>
              </div>

              <button
                onClick={() => navigate("/recommend")}
                className="group relative inline-flex items-center justify-center px-6 py-2 font-semibold text-white transition-all duration-200 bg-red-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                <div className="absolute -inset-3 transition-all duration-200 rounded-full opacity-30 group-hover:opacity-100 blur-lg bg-red-600"></div>
                <span className="relative flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-300" />
                  AI Pick
                </span>
              </button>
              
              <SignButton />
            </nav>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-4">
              <SignButton />
              <button
                className="text-white focus:outline-none p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-zinc-900/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-5">
              <a
                href="#"
                className="block text-zinc-300 hover:text-white text-lg font-medium px-4 py-2 hover:bg-white/5 rounded-lg"
              >
                Home
              </a>
              <a
                href="#"
                className="block text-zinc-300 hover:text-white text-lg font-medium px-4 py-2 hover:bg-white/5 rounded-lg"
              >
                Movies
              </a>
              <a
                href="/watchlist"
                className="block text-zinc-300 hover:text-white text-lg font-medium px-4 py-2 hover:bg-white/5 rounded-lg"
              >
                Watchlist
              </a>
              <button
                onClick={() => {
                  navigate("/recommend");
                  setMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles
                  className="text-yellow-300"
                  size={20}
                />
                <span className="tracking-wide">AI Recommendation</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

const SignButton = () => {
  return (
    <div className="flex items-center">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-zinc-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 ring-2 ring-white/20 hover:ring-white/50 transition-all"
            }
          }}
        />
      </SignedIn>
    </div>
  );
};

export default Navbar;
