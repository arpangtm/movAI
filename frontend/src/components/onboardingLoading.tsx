import { useState, useEffect } from "react";
import { Sparkles, Brain, Music, Zap, Popcorn } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LoadingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; delay: number; duration: number }[]
  >([]);

  const loadingTexts = [
    {
      text: "Mixing some magic dust to craft your perfect picks…",
      icon: Sparkles,
      visual: "sparkles",
    },
    {
      text: "Our AI is thinking really hard (but without overheating)…",
      icon: Brain,
      visual: "brain",
    },
    {
      text: "Tuning into your vibe and curating your personal playlist…",
      icon: Music,
      visual: "music",
    },
    {
      text: "Pulling recommendations out of the hat… hold tight!",
      icon: Zap,
      visual: "magic",
    },
    {
      text: "Popping some data kernels for your next big binge…",
      icon: Popcorn,
      visual: "popcorn",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: {
        id: number;
        x: number;
        y: number;
        delay: number;
        duration: number;
      }[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const particleInterval = setInterval(generateParticles, 5000);
    return () => clearInterval(particleInterval);
  }, []);

  const renderVisual = () => {
    const current = loadingTexts[currentIndex];
    const IconComponent = current.icon;

    switch (current.visual) {
      case "sparkles":
        return (
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div
              className="absolute -translate-y-1/3
             inset-0"
            >
              <DotLottieReact
                src="https://lottie.host/069fd029-c608-4f21-a374-220fbc2dfa6f/7WspYZpwgG.lottie"
                loop
                autoplay
              />
            </div>
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full border-4 border-yellow-400 rounded-full opacity-20"></div>
            </div>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
                style={{
                  top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 40}%`,
                  left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 40}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case "brain":
        return (
          <DotLottieReact
            src="https://lottie.host/962666d7-3afd-4cf4-9615-a0034c9b7563/m7VNUy6CVG.lottie"
            loop
            autoplay
          />
        );

      case "music":
        return (
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="relative animate-bounce">
              <IconComponent size={48} className="text-blue-400 mx-auto" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${20 + i * 8}px`,
                  bottom: "20%",
                  left: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        );

      case "magic":
        return (
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="relative animate-bounce">
              <IconComponent size={48} className="text-purple-400 mx-auto" />
            </div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-300 animate-ping"
                style={{
                  top: `${Math.random() * 60 + 10}%`,
                  left: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.25}s`,
                  fontSize: `${12 + Math.random() * 8}px`,
                }}
              >
                ✨
              </div>
            ))}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        );

      case "popcorn":
        return (
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="relative animate-bounce">
              <DotLottieReact
                src="https://lottie.host/b28dbe3e-0c01-4588-b24d-42b10c666e60/FQza8q757F.lottie"
                loop
                autoplay
              />
            </div>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-bounce"
                style={{
                  top: `${Math.random() * 40 + 10}%`,
                  left: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 0.8}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Particles */}
      {particles.map(
        (particle: {
          id: number;
          x: number;
          y: number;
          delay: number;
          duration: number;
        }) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-red-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        )
      )}

      {/* Main Loading Content */}
      <div className="text-center z-10 max-w-lg px-8">
        {/* Visual Animation */}
        <div className="mb-8">{renderVisual()}</div>

        {/* Loading Text */}
        <div className="mb-8">
          <h2
            key={currentIndex}
            className="text-2xl md:text-3xl font-bold text-white mb-4 animate-fade-in"
            style={{
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            {loadingTexts[currentIndex].text}
          </h2>
        </div>

        {/* Progress Indicators */}
        {/* <div className="flex justify-center space-x-2 mb-8">
          {loadingTexts.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentIndex ? "bg-red-500 scale-125" : "bg-slate-600"
              }`}
            />
          ))}
        </div> */}

        {/* Animated Progress Bar */}
        {/* <div className="w-full bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-500 to-red-400 h-full rounded-full animate-pulse"
            style={{
              width: `${((currentIndex + 1) / loadingTexts.length) * 100}%`,
              transition: "width 0.6s ease-in-out",
            }}
          />
        </div> */}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
