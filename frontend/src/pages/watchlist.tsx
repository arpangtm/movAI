import { useState, useEffect } from "react";
import { Star, Clock, Calendar, TrendingUp, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { TMDBMovie } from "../../types/responseTypes";

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
        "https://movai-2gkg.onrender.com/watchlist-data",
        // "http://localhost:3001/watchlist-data",
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
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-100 text-lg">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error: {error}</p>
          <button
            onClick={fetchWatchlist}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-red-200">
            {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} in
            your collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-red-400 text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-red-200">
              Start adding movies to build your perfect collection!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="bg-gradient-to-b from-red-900/20 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-red-800/30 hover:border-red-600/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center">
                      <span className="text-red-200 text-4xl">🎬</span>
                    </div>
                  )}

                  {/* Trending Badge */}
                  {movie.trending && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <TrendingUp size={12} />
                      Trending
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Rating Overlay */}
                  {movie.rating > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
                      <Star
                        size={12}
                        className="text-yellow-400 fill-current"
                      />
                      {movie.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
                    {movie.title}
                  </h3>

                  {/* Year and Duration */}
                  <div className="flex items-center gap-4 text-red-200 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {movie.year}
                    </div>
                    {movie.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {movie.duration}
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genre && movie.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genre.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="bg-red-800/30 text-red-200 px-2 py-1 rounded-full text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {movie.description && (
                    <p className="text-red-100 text-sm line-clamp-3 opacity-80">
                      {movie.description}
                    </p>
                  )}

                  {/* Director */}
                  {movie.director && movie.director !== "Unknown" && (
                    <p className="text-red-300 text-sm mt-2">
                      Directed by {movie.director}
                    </p>
                  )}
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
