import React, { useEffect, useState } from "react";
import {
  BotResponse,
  Recommendation,
  ResponseType,
} from "../../types/responseTypes";

import {
  Star,
  Calendar,
  Clock,
  Play,
  Heart,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const MessageComponent = ({ message }: { message: ResponseType }) => {
  const [movieDetails, setMovieDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      if (
        message.type === "bot" &&
        message.content &&
        typeof message.content === "object" &&
        "recommendations" in message.content
      ) {
        setLoading(true);
        const contentDetails = message.content.recommendations.map(
          (recommendation: Recommendation) => ({
            title: recommendation.title,
            year: recommendation.year,
          })
        );

        const details = await getMovieDetails(contentDetails);

        // Merge API data with recommendation data (genre and reason)

        const enrichedDetails = details.map((movie) => {
          const recommendation = message.content.recommendations.find(
            (rec: Recommendation) =>
              rec.title === movie.title ||
              rec.title === movie.name ||
              rec.title === movie.original_name ||
              rec.title === movie.original_title
          );
          return {
            ...movie,
            recommendationGenre: recommendation?.genre,
            recommendationReason: recommendation?.reason,
            recommendationLink: recommendation?.link,
            recommendationTitle: recommendation?.title,
          };
        });

        setMovieDetails(enrichedDetails);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [message]);

  // Function to get runtime in hours and minutes
  const formatRuntime = (minutes: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Function to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400";
    if (rating >= 7) return "text-yellow-400";
    if (rating >= 6) return "text-orange-400";
    return "text-red-400";
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (
    message.type === "bot" &&
    message.content &&
    typeof message.content === "object" &&
    "recommendations" in message.content
  ) {
    return (
      <div className="space-y-4 p-2">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span>Fetching movie details...</span>
            </div>
          </div>
        ) : movieDetails.length > 0 ? (
          <div className="grid gap-4">
            {movieDetails.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10"
              >
                <div className="flex">
                  {/* Movie Poster */}
                  <div className="relative flex-shrink-0">
                    {movie.poster_path ? (
                      <div className="relative group">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                          alt={`${movie.recommendationTitle} poster`}
                          className="w-32 h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-48 bg-gray-800 flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-600" />
                      </div>
                    )}

                    {/* Rating Badge */}
                    {movie.vote_average && (
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span
                          className={`text-xs font-bold ${getRatingColor(
                            movie.vote_average
                          )}`}
                        >
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                            {movie.recommendationTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            {movie.release_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(movie.release_date).getFullYear()}
                                </span>
                              </div>
                            )}
                            {movie.runtime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatRuntime(movie.runtime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Genres */}
                      <div className="mb-3">
                        {movie.recommendationGenre && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {movie.recommendationGenre
                              .split(",")
                              .map((genre: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-full"
                                >
                                  {genre.trim()}
                                </span>
                              ))}
                          </div>
                        )}

                        {movie.genres && movie.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.slice(0, 3).map((genre: any) => (
                              <span
                                key={genre.id}
                                className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 text-gray-300 text-xs rounded-full"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Overview */}
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                        {truncateText(movie.overview, 200)}
                      </p>

                      {/* AI Recommendation Reason */}
                      {movie.recommendationReason && (
                        <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-red-500/20 rounded-xl p-4 mt-auto">
                          <div className="flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-red-400 font-medium text-xs uppercase tracking-wide mb-1">
                                Why we recommend this
                              </p>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {movie.recommendationReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Info Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {movie.vote_count && (
                            <span>
                              {movie.vote_count.toLocaleString()} reviews
                            </span>
                          )}
                          {movie.popularity && (
                            <span>
                              Popularity: {Math.round(movie.popularity)}
                            </span>
                          )}
                        </div>

                        {movie.adult && (
                          <span className="px-2 py-1 bg-red-900/30 border border-red-500/30 text-red-400 text-xs rounded">
                            18+
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-gray-400">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No movie details available</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For plain text responses
  return (
    <div className="whitespace-pre-wrap p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-gray-100">
      {message.content}
    </div>
  );
};

const getMovieDetails = async (titles: { title: string; year: number }[]) => {
  const results: any[] = [];

  for (const title of titles) {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        title.title
      )}&year=${title.year}`,
      {
        headers: {
          Authorization: "Bearer " + import.meta.env.VITE_PUBLIC_TMDB_API_KEY,
        },
      }
    );

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      results.push(data.results[0]); // pick the best match
    }
  }

  return results;
};

export default MessageComponent;
