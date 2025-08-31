import React, { useState, useEffect } from "react";
import { X, Film, MessageCircle, Sparkles, Crown, Lock } from "lucide-react";

const MovieFeatureBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animate in on component mount
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`w-full transform transition-all duration-300 ease-out ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <X size={16} />
        </button>

        <div className="relative px-6 py-4">
          <div className="flex items-start space-x-4">
            {/* Icon section */}
            <div className="flex-shrink-0">
              <div className="p-2 rounded-full bg-red-500/20 border border-red-500/30">
                <Lock className="text-red-400" size={20} />
              </div>
            </div>

            {/* Content section */}
            <div className="flex-grow">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Login to unlock features
                </h3>
              </div>

              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                You now have access to personalized AI recommendations and our
                smart movie chatbot. Discover your next favorite film with
                tailored suggestions.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-300">AI Recommendations</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-300">Movie Chatbot</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-300">Custom Watchlists</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle border accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      </div>
    </div>
  );
};

export default MovieFeatureBanner;
