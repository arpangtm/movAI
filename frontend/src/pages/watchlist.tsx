import { useState, useEffect } from "react";
import { Star, TrendingUp, Trash2, Film, ArrowLeft } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { TMDBMovie } from "../../types/responseTypes";
import Navbar from "../components/navbar";

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((token) => {
      setToken(token);
    });
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/watchlist-data`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }

      const data = await response.json();

      setWatchlist(data.watchlist || []);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((movie: TMDBMovie) => movie.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg animate-pulse">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <p className="text-red-400 text-xl mb-6">Unable to load watchlist</p>
            <button
              onClick={fetchWatchlist}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                My Watchlist
              </h1>
              <p className="text-zinc-400 text-lg">
                {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} saved for later
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-zinc-900/50 p-8 rounded-full mb-6 ring-1 ring-white/10">
              <Film className="h-16 w-16 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Your watchlist is empty
            </h2>
            <p className="text-zinc-400 max-w-md mb-8">
              Movies you add to your watchlist will appear here. Start exploring to build your collection.
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watchlist.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="group relative bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10"
              >
                {/* Poster */}
                <div className="aspect-[2/3] relative overflow-hidden">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <Film className="h-12 w-12 text-zinc-600" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {movie.trending && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow-lg">
                        <TrendingUp size={12} className="mr-1" />
                        TRENDING
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.id);
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-zinc-300 mb-3">
                      <span className="font-medium">{movie.year}</span>
                      {movie.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star size={14} fill="currentColor" />
                          <span className="font-bold">{movie.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    {movie.genre && movie.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {movie.genre.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-zinc-200 backdrop-blur-sm border border-white/5"
                          >
                            {genre}
                          </span>
                        ))}
                        {movie.genre.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-zinc-200 backdrop-blur-sm border border-white/5">
                            +{movie.genre.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
