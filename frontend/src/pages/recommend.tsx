import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Settings, BarChart } from "lucide-react";
import MessageComponent from "../components/messageComponent";
import { useAuth } from "@clerk/clerk-react";

const Recommend = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "🎬 Hello! I'm your personal movie recommendation agent. I can help you discover amazing films based on your mood, preferences, or any specific criteria. What kind of movie experience are you looking for today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [token, setToken] = useState("");
  const { getToken } = useAuth();

  // Mock movie poster URLs for backdrop
  const moviePosters = [
    "https://images.unsplash.com/photo-1489599511978-e0e4c1faf0e1?w=300&h=450&fit=crop",
    "https://images.unsplash.com/photo-1478720568477-b0ff2b17e17f?w=300&h=450&fit=crop",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
    "https://images.unsplash.com/photo-1518930259200-72ea0ca0f7b8?w=300&h=450&fit=crop",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getToken()
      .then((token) => {
        setToken(token);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }, [getToken]);

  const callLLM = async (userMessage: string) => {
    try {
      const res = await fetch("https://movai-2gkg.onrender.com/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userMessage }),
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const botResponse = await callLLM(inputMessage);
      console.log(botResponse);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "I want something like Inception",
    "Best movies from 2023",
    "Feel-good comedies for tonight",
    "Underrated sci-fi gems",
    "Movies for a date night",
    "Action movies with great plots",
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scrolling Movie Poster Backdrop */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <style>{`
          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes scrollDown {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          .scroll-up {
            animation: scrollUp 30s linear infinite;
          }
          .scroll-down {
            animation: scrollDown 35s linear infinite;
          }
        `}</style>

        <div className="flex space-x-6 h-[200vh]">
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`flex flex-col space-y-6 ${
                colIndex % 2 === 0 ? "scroll-up" : "scroll-down"
              }`}
            >
              {moviePosters
                .concat(moviePosters)
                .concat(moviePosters)
                .map((poster, index) => (
                  <div
                    key={`col${colIndex}-${index}`}
                    className="bg-gray-800 rounded-xl overflow-hidden h-[250px] w-[180px] transform hover:scale-105 transition-transform duration-500"
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
          ))}
        </div>

        <div className="absolute inset0 bg-gradient-to-b from-black/95 via-black/80 to-black/95" />
      </div>

      {/* Main Chat Interface */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500/20 p-2 rounded-full">
                <BarChart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MovAI</h1>
                <p className="text-sm text-gray-400">
                  Your Personal Movie Recommendation Agent
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Gemini API Key (Optional - for enhanced recommendations)
                </label>
                {/* <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.type === "user"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-700/50 text-gray-300"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                <div
                  className={`max-w-2xl ${
                    message.type === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl ${
                      message.type === "user"
                        ? "bg-red-500/20 border border-red-500/30 text-white"
                        : "bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-100"
                    }`}
                  >
                    <MessageComponent message={message} />
                  </div>
                  <div
                    className={`mt-1 text-xs text-gray-500 ${
                      message.type === "user" ? "text-right" : ""
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-gray-700/50 text-gray-300">
                  <Bot className="w-5 h-5" />
                </div>
                <TypingMessages />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-800">
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-400 text-sm mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className=" backdrop-blur-sm border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask for movie recommendations... (e.g., 'I want something like Inception' or 'Best comedies from 2023')"
                  className="w-full p-4 pr-12 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none min-h-[60px] max-h-32"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-3 bottom-3 p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by Gemini AI</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypingMessages = () => {
  const messages: string[] = [
    "Bet you thought I’d yeet movie recs at you real quick, huh? Nah, I’m vibin’ in Arpan’s trash-tier code, clownin’ your free-tier thirst.",
    "🍿 Arpan said this would be fast. We believed Arpan. That was our first mistake.",
    "🎬 Fetching a movie recommendation… powered by hopes, dreams, and zero dollars.",
    "Sike, you thought I’d yeet movie recs at you already? Nope, I’m still.... chilling 😎",
    "🤖 The API’s doing its best. Unfortunately, its best is… this.",
    "Arpan’s out here promising cinematic gold, but his site’s moving like it’s stuck in molasses. Hang tight.",
    "🧙‍♂️ Your cinematic destiny is being determined by Arpan’s very affordable choice.",
    "I was tasked with finding your next binge, but here I am, mocking Arpan’s duct-taped tech while you twiddle your thumbs.😝",
    "📦 Free API activated. Please send snacks while we wait for greatness.",
    "💪 It’s working hard. Like, Arpan-in-the-gym-once-a-year hard.",
    "🌱 Arpan swears the recommendations get better over time. Like mold.",
    "I ought to be curating your watchlist, but I’m here, roasting Arpan’s site that’s slower than your last Netflix choice.",
    "🕳️ We’re scraping the bottom of the data barrel, one byte at a time.",
    "🧠 Hang tight. The API just Googled ‘what is a movie.’",
    "🍕 Arpan guaranteed entertainment. Arpan also thinks pineapple belongs on pizza.",
    "I’m supposed to whip up recs, but I’m here, juggling Arpan’s broken bits of code, laughing at your trust in his budget bot.",
  ];
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  const isFirstRender = useRef(true);

  useEffect(() => {
    let timeout;

    if (isFirstRender.current) {
      // Delay only before first message
      timeout = setTimeout(() => {
        isFirstRender.current = false;
        setCharIndex((prev) => prev + 1);
        setDisplayText((prev) => prev + messages[messageIndex][charIndex]);
      }, 2000); // 2-second one-time delay
    } else if (charIndex < messages[messageIndex].length) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
        setDisplayText((prev) => prev + messages[messageIndex][charIndex]);
      }, 20); // normal typing speed
    } else {
      timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayText("");
        setMessageIndex(() => Math.floor(Math.random() * messages.length));
      }, 3000); // pause between messages
    }

    return () => clearTimeout(timeout);
  }, [charIndex, messageIndex]);

  return (
    <div className="text-white  bg-gray-900 p-4 rounded shadow-md min-h-[4rem] flex items-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-opacity-70"></div>
      <div>{displayText}</div>
    </div>
  );
};

export default Recommend;
