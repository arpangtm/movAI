import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  Check,
  ArrowLeft,
  Users,
  Film,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { getWatchlist, updateWatchlist } from "../scripts/watchlist";
import { TMDBMovie } from "../../types/responseTypes";

const MovieDetailsPage = () => {
  // Default to Fight Club for demo
  const { id: movieId } = useParams();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  useEffect(() => {
    getToken().then((token) => {
      setToken(token);
      getWatchlist(token as string).then((watchlist) => {
        setIsInWatchlist(watchlist.includes(Number(movieId)));
      });
    });
  }, [token, movieId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://movai-2gkg.onrender.com/movie/${movieId}/full`
        // `http://localhost:3001/movie/${movieId}/full`
      );
      const data = await response.json();
      setMovie(data);
      //   setCredits(creditsData);z
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = () => {
    updateWatchlist(
      token as string,
      Number(movieId),
      isInWatchlist ? "remove" : "add"
    );
    setIsInWatchlist(!isInWatchlist);
  };

  const handleGoBack = () => {
    // In a real app, this would use router navigation
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading movie details...</p>
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
            onClick={fetchMovieDetails}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Watchlist
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Poster (Blurred) */}
        {(movie.backdrop || movie.poster) && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url(${movie.backdrop || movie.poster})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90"></div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-slate-600">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <Film size={64} className="text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title, Tagline and Year */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    {movie.title}
                  </h1>
                  {movie.trending && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <TrendingUp size={16} />
                      Trending
                    </div>
                  )}
                </div>
                {movie.tagline && (
                  <p className="text-slate-400 italic text-lg mb-2">
                    "{movie.tagline}"
                  </p>
                )}
                <p className="text-slate-300 text-xl">{movie.year}</p>
              </div>

              {/* Rating and Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                {movie.rating > 0 && (
                  <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                    <Star size={20} className="text-yellow-400 fill-current" />
                    <span className="text-white font-semibold text-lg">
                      {movie.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400">/ 10</span>
                  </div>
                )}

                {movie.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>{movie.duration}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{movie.year}</span>
                </div>
              </div>

              {/* Genres */}
              {movie.genre && movie.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-600"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={toggleWatchlist}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/watch?v=${movie.trailer}`,
                      "_blank"
                    )
                  }
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Watch Trailer
                </button>
              </div>

              {/* Description */}
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Overview
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {movie.description ||
                    "No description available for this movie."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Director and Cast Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Director */}
          {movie.director && movie.director !== "Unknown" && (
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Film size={20} />
                Director
              </h3>
              <p className="text-slate-300">{movie.director}</p>
            </div>
          )}

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users size={20} />
                Cast
              </h3>
              <div className="space-y-2">
                {movie.cast.slice(0, 5).map((actor, index) => (
                  <p key={index} className="text-slate-300">
                    {actor}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl font-bold text-white">
              {movie.rating?.toFixed(1) || "N/A"}
            </div>
            <div className="text-slate-400 text-sm">User Score</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl font-bold text-white">{movie.year}</div>
            <div className="text-slate-400 text-sm">Release Year</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl font-bold text-white">
              {movie.genre?.length || 0}
            </div>
            <div className="text-slate-400 text-sm">Genres</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl font-bold text-white">
              {movie.duration || "N/A"}
            </div>
            <div className="text-slate-400 text-sm">Runtime</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl font-bold text-white">
              {movie.status || "N/A"}
            </div>
            <div className="text-slate-400 text-sm">Status</div>
          </div>
        </div>

        {/* Budget and Revenue */}
        {movie.budget &&
          movie.revenue &&
          (movie.budget > 0 || movie.revenue > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.budget > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Budget
                  </h3>
                  <p className="text-2xl font-bold text-green-400">
                    ${movie.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {movie.revenue > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Revenue
                  </h3>
                  <p className="text-2xl font-bold text-green-400">
                    ${movie.revenue.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
