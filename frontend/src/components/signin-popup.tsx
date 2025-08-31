import React, { useState, useEffect } from "react";
import { X, Film, MessageCircle, Sparkles, User } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

const MovieSignInPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem("moviePopupShown");

    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("moviePopupShown", "true");

    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleSignIn = () => {
    sessionStorage.setItem("moviePopupShown", "true");

    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "bg-opacity-60 backdrop-blur-sm" : "bg-opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 animate-pulse" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <X size={20} />
          </button>

          <div className="relative p-8">
            {/* Header with icons */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-red-700">
                  <Film className="text-white" size={24} />
                </div>
                <div className="p-2 rounded-full bg-gradient-to-r from-red-700 to-red-900">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div className="p-2 rounded-full bg-gradient-to-r from-red-900 to-black">
                  <Sparkles className="text-white" size={24} />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                Unlock Your Perfect Movies
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Get personalized recommendations tailored to your taste and chat
                with our AI movie expert for instant suggestions.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-left">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r  flex items-center justify-center mr-3">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300">
                    AI-powered personalized recommendations
                  </span>
                </div>
                <div className="flex items-center text-left">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center mr-3">
                    <MessageCircle size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300">
                    Smart chatbot for instant movie help
                  </span>
                </div>
                <div className="flex items-center text-left">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center mr-3">
                    <Film size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300">
                    Curated watchlists just for you
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r to-red-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg"
                >
                  <SignInButton></SignInButton>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full text-gray-400 hover:text-white py-2 transition-colors duration-200"
                >
                  Maybe later
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieSignInPopup;
