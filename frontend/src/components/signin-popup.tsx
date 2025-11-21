import React, { useState, useEffect } from "react";
import { X, Film, Sparkles, Clapperboard } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

const MovieSignInPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem("moviePopupShown");

    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Small delay to ensure render before animation starts
        requestAnimationFrame(() => setIsAnimating(true));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("moviePopupShown", "true");
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleSignInClick = () => {
    sessionStorage.setItem("moviePopupShown", "true");
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl ring-1 ring-white/10">
          
          {/* Subtle Top Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 p-2 text-zinc-500 hover:text-zinc-200 transition-colors duration-200 rounded-full hover:bg-zinc-800/50"
          >
            <X size={18} />
          </button>

          <div className="p-8 pt-10 text-center">
            {/* Icon Header */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-inner">
              <Clapperboard className="h-8 w-8 text-indigo-400" />
            </div>

            {/* Main Content */}
            <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
              Unlock the Full Experience
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              Sign in to discover personalized movie recommendations, create watchlists, and chat with our AI film expert.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                <Sparkles size={12} className="mr-1.5 text-amber-400" />
                AI Recommendations
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                <Film size={12} className="mr-1.5 text-emerald-400" />
                Curated Watchlists
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="w-full">
                {/* Clerk SignInButton wraps the custom button for proper functionality */}
                <SignInButton mode="modal">
                  <button
                    onClick={handleSignInClick}
                    className="w-full group relative flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)]"
                  >
                    <span>Get Started</span>
                    <Sparkles size={16} className="text-indigo-600 transition-transform group-hover:rotate-12" />
                  </button>
                </SignInButton>
              </div>

              <button
                onClick={handleClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200 py-2"
              >
                Continue as guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieSignInPopup;
