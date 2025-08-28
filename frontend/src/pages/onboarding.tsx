import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Play,
  Star,
  Film,
  Users,
  Tv,
  Shield,
  SkipForward,
} from "lucide-react";

import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  checkOnboarding,
  pollOnboardingStatus,
} from "../scripts/onboarding.ts";
import LoadingScreen from "../components/onboardingLoading.tsx";

const MovieOnboarding = () => {
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [token, setToken] = useState<string | null>("");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    genres: [] as string[],
    directorsActors: "",
    lovedMovies: "",
    streamingPlatforms: [] as string[],
    contentSensitivity: {
      violence: "moderate",
      nudity: "moderate",
      horror: "moderate",
    },
  });

  useEffect(() => {
    getToken().then((token) => {
      console.log(token);
      setToken(token);
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    checkOnboarding(token).then((onboarded) => {
      if (onboarded.error) {
        setError(onboarded.error as string);
        return;
      }
      if (onboarded.needsOnboarding) {
        setAllowed(true);
        return;
      }
      navigate("/");
    });
  }, [token, navigate]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!allowed) return <p>Checking onboarding status...</p>;

  // Mock movie poster URLs for backdrop
  const moviePosters = [
    "/onboarding/poster1.jpg",
    "/onboarding/poster2.jpg",
    "/onboarding/poster3.jpg",
    "/onboarding/poster4.jpg",
    "/onboarding/poster5.jpg",
    "/onboarding/poster6.jpg",
    "/onboarding/poster7.avif",
    "/onboarding/poster8.jpg",
    "/onboarding/poster9.jpg",
    "/onboarding/poster10.jpg",
    "/onboarding/poster11.jpg",
    "/onboarding/poster12.jpg",
    "/onboarding/poster13.jpg",
    "/onboarding/poster14.jpg",
    "/onboarding/poster15.jpg",
  ];

  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Animation",
    "Documentary",
    "Fantasy",
    "Mystery",
  ];

  const platforms = [
    "Netflix",
    "Amazon Prime",
    "Disney+",
    "HBO Max",
    "Hulu",
    "Apple TV+",
    "Paramount+",
    "Peacock",
    "YouTube Premium",
  ];

  const steps = [
    {
      title: "Favorite Genres",
      subtitle: "What types of movies do you love?",
      icon: Film,
    },
    {
      title: "Directors & Actors",
      subtitle: "Who are your favorite filmmakers and stars?",
      icon: Users,
    },
    {
      title: "Movies You Loved",
      subtitle: "Tell us about some films that captivated you",
      icon: Star,
    },
    {
      title: "Streaming Platforms",
      subtitle: "Which services do you currently use?",
      icon: Tv,
    },
    {
      title: "Content Preferences",
      subtitle: "Help us tailor recommendations to your comfort level",
      icon: Shield,
    },
  ];

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      streamingPlatforms: prev.streamingPlatforms.includes(platform)
        ? prev.streamingPlatforms.filter((p) => p !== platform)
        : [...prev.streamingPlatforms, platform],
    }));
  };

  const handleSensitivityChange = (
    type: keyof typeof formData.contentSensitivity,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      contentSensitivity: {
        ...prev.contentSensitivity,
        [type]: value,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log("Form submitted:", formData);
    console.log("token", token);
    fetch("http://localhost:3001/user-interests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setOnboardingLoading(true);
    pollOnboardingStatus(token as string);
  };

  if (onboardingLoading) return <LoadingScreen />;
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scrolling Movie Poster Backdrop */}
      <div className="absolute opacity-50 overflow-hidden">
        <style>{`
          @keyframes scrollUp {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
          @keyframes scrollDown {
            0% {
              transform: translateY(-50%);
            }
            100% {
              transform: translateY(0);
            }
          }
          .scroll-up {
            animation: scrollUp 20s linear infinite;
          }
          .scroll-down {
            animation: scrollDown 25s linear infinite;
          }
        `}</style>

        <div className="flex space-x-4 h-[200vh] w-full">
          {/* Column 1 - Scrolling Up */}
          <div className="flex flex-col space-y-4 scroll-up w-full">
            {moviePosters
              .concat(moviePosters)
              .concat(moviePosters)
              .map((poster, index) => (
                <div
                  key={`col1-${index}`}
                  className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 h-[500px] min-h-[500px] w-[250px]"
                  style={{
                    backgroundImage: `url(${poster})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ))}
          </div>

          {/* Column 2 - Scrolling Down */}
          <div className="flex flex-col space-y-4 scroll-down w-full">
            {moviePosters
              .concat(moviePosters)
              .concat(moviePosters)
              .map((poster, index) => (
                <div
                  key={`col2-${index}`}
                  className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 h-[500px] min-h-[500px] w-[250px]"
                  style={{
                    backgroundImage: `url(${moviePosters[index + 3]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ))}
          </div>

          {/* Column 3 - Scrolling Up */}
          <div className="flex flex-col space-y-4 scroll-up w-full">
            {moviePosters
              .concat(moviePosters)
              .concat(moviePosters)
              .map((poster, index) => (
                <div
                  key={`col3-${index + 6}`}
                  className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 h-[500px] min-h-[500px] w-[250px]"
                  style={{
                    backgroundImage: `url(${moviePosters[index + 6]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ))}
          </div>

          {/* Column 4 - Scrolling Down */}
          <div className="flex flex-col space-y-4 scroll-down w-full">
            {moviePosters
              .concat(moviePosters)
              .concat(moviePosters)
              .map((poster, index) => (
                <div
                  key={`col4-${index}`}
                  className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 h-[500px] min-h-[500px] w-[250px]"
                  style={{
                    backgroundImage: `url(${moviePosters[index + 9]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-white">MovieDB</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Let's personalize your movie experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {React.createElement(steps[currentStep].icon, {
                  className: "w-8 h-8 text-red-500 mr-3",
                })}

                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-gray-400">{steps[currentStep].subtitle}</p>
                </div>
              </div>

              <div>
                <button className="flex font-bold text-white cursor-pointer">
                  Skip All
                  {/* <SkipForward className="w-5 h-5" /> */}
                </button>
              </div>
            </div>

            {/* Step 0: Genres */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.genres.includes(genre)
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-red-500/50"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Directors & Actors */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <textarea
                  placeholder="e.g., Christopher Nolan, Greta Gerwig, Leonardo DiCaprio, Margot Robbie..."
                  value={formData.directorsActors}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      directorsActors: e.target.value,
                    }))
                  }
                  className="w-full h-32 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Step 2: Loved Movies */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <textarea
                  placeholder="e.g., The Dark Knight, Parasite, Inception, Lady Bird, Dune..."
                  value={formData.lovedMovies}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lovedMovies: e.target.value,
                    }))
                  }
                  className="w-full h-32 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Step 3: Streaming Platforms */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.streamingPlatforms.includes(platform)
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-red-500/50"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Content Sensitivity */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {[
                  {
                    key: "violence",
                    label: "Violence",
                    desc: "Action sequences, combat, fighting",
                  },
                  {
                    key: "nudity",
                    label: "Nudity/Sexual Content",
                    desc: "Adult themes and situations",
                  },
                  {
                    key: "horror",
                    label: "Horror/Scary Content",
                    desc: "Jump scares, supernatural, gore",
                  },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="space-y-3">
                    <div>
                      <h4 className="text-white font-medium">{label}</h4>
                      <p className="text-gray-400 text-sm">{desc}</p>
                    </div>
                    <div className="flex space-x-2">
                      {["minimal", "moderate", "no-limits"].map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            handleSensitivityChange(
                              key as keyof typeof formData.contentSensitivity,
                              level
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            formData.contentSensitivity[
                              key as keyof typeof formData.contentSensitivity
                            ] === level
                              ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                              : "bg-gray-800/50 border-2 border-gray-700 text-gray-300 hover:border-red-500/50"
                          }`}
                        >
                          {level === "minimal"
                            ? "Minimal"
                            : level === "moderate"
                            ? "Moderate"
                            : "No Limits"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                Previous
              </button>

              <button
                onClick={
                  currentStep === steps.length - 1 ? handleSubmit : nextStep
                }
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
              >
                <span>
                  {currentStep === steps.length - 1
                    ? "Complete Setup"
                    : "Continue"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieOnboarding;
