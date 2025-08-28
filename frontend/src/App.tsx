import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Star,
  Play,
  Plus,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "./components/navbar";
import { error } from "console";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useDebounce } from "./hooks/useDebounce";
import { getWatchlist } from "./scripts/watchlist";
import { featuredMovie, Movie } from "../types/responseTypes";
import { useNavigate } from "react-router-dom";

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Biography",
  "Comedy",
  "Crime",
  "Drama",
  "History",
  "Mystery",
  "Science Fiction",
  "Thriller",
  "Western",
  "Romance",
  "Fantasy",
];

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [selectedMovie, setSelectedMovie] = useState<featuredMovie | null>(
    null
  );
  const [watchlist, setWatchlist] = useState<number[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState<featuredMovie[]>([]);
  const [aiRecommendedMovies, setAiRecommendedMovies] = useState<
    featuredMovie[]
  >([]);
  const [movies, setMovies] = useState<featuredMovie[]>([]);

  const [token, setToken] = useState<string | null>(null);

  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getToken().then((token) => {
      setToken(token);
    });
  }, []);

  useEffect(() => {
    const ftMovies = getFeaturedMovies();
    const trMovies = getTrendingMovies();
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  useEffect(() => {
    searchMovies();
  }, [debouncedSearchTerm]);

  useEffect(() => {}, [selectedMovie]);

  useEffect(() => {
    getWatchlist(token).then((watchlist) => {
      setWatchlist(watchlist || []);
    });
  }, [token]);
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length
    );
  };

  const searchMovies = async () => {
    const res = await fetch("https://movai-2gkg.onrender.com/search-movies", {
      // const res = await fetch("http://localhost:3001/search-movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify({
        searchTerm: debouncedSearchTerm,
      }),
    });
    if (!res.ok) {
      console.error("Failed to fetch movies");
      return;
    }
    const data = await res.json();
    setMovies(data);
  };
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter((movie) => {
      const matchesGenre =
        selectedGenre === "All" || movie.genre.includes(selectedGenre);
      return matchesGenre;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.year - a.year;
        case "title":
          return a.title.localeCompare(b.title);
        case "trending":
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedGenre, sortBy, movies]);

  const toggleWatchlist = async (movieId: number) => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    const isInWatchlist = watchlist.includes(movieId);
    const action = isInWatchlist ? "remove" : "add";

    // Update local state
    setWatchlist((prev) =>
      isInWatchlist ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );

    // Sync with backend
    try {
      const response = await fetch(
        // "http://localhost:3001/watchlist",
        "https://movai-2gkg.onrender.com/watchlist",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Make sure token is available
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId, action }),
        }
      );

      if (!response.ok) throw new Error("Failed to update watchlist");
      const data = await response.json();
    } catch (err) {
      console.error("Error syncing watchlist:", err);
    }
  };

  const getFeaturedMovies = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    const res = await fetch("https://movai-2gkg.onrender.com/featured", {
      // const res = await fetch("http://localhost:3001/featured", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
    });

    const data = await res.json();

    setFeaturedMovies(data.slice(0, 4));
    setAiRecommendedMovies(data.slice(4, 8));
  };

  const getTrendingMovies = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    const res = await fetch("https://movai-2gkg.onrender.com/trending", {
      // const res = await fetch("http://localhost:3001/trending", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
    });

    const data = await res.json();
    setMovies(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      {/* Hero Carousel Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="relative w-full h-full">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    {/* Badges */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                        <Sparkles className="h-4 w-4 text-red-400" />
                        <span className="text-red-300 text-sm font-medium">
                          Featured
                        </span>
                      </div>
                      {movie.trending && (
                        <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                          <span className="text-orange-300 text-sm font-medium">
                            Trending
                          </span>
                        </div>
                      )}
                      {movie.aiRecommended && (
                        <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-600/30 rounded-full px-3 py-1">
                          <Sparkles className="h-4 w-4 text-red-400" />
                          <span className="text-red-300 text-sm font-medium">
                            AI Pick
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Movie Title */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      {movie.title}
                    </h1>

                    {/* Movie Info */}
                    <div className="flex items-center space-x-6 mb-6 text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 font-semibold">
                          {parseFloat(`${movie.rating}`).toPrecision(2)}
                        </span>
                      </div>
                      <span>{movie.year}</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{movie.duration}</span>
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genre.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 text-sm rounded-lg"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-lg text-slate-300 z-10 pointer-events-none">
                      {movie.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex relative items-center space-x-4 min-h-[40px] mt-4 z-20">
                      <button
                        onClick={() => {
                          setSelectedMovie(featuredMovies[currentSlide]);
                        }}
                        className="flex items-center space-x-3 bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                      >
                        <Play className="h-5 w-5" />
                        <span>Watch Trailer</span>
                      </button>
                      <button
                        onClick={() =>
                          toggleWatchlist(
                            Number(featuredMovies[currentSlide].id)
                          )
                        }
                        className={`flex items-center space-x-3 font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg ${
                          watchlist.includes(
                            Number(featuredMovies[currentSlide].id)
                          )
                            ? "bg-green-500/20 border-2 border-green-500 text-green-400 hover:bg-green-500/30"
                            : "bg-slate-800/60 backdrop-blur-sm border-2 border-slate-700 text-white hover:bg-slate-700/60 hover:border-slate-600"
                        }`}
                      >
                        <Plus className="h-5 w-5" />
                        <span>
                          {watchlist.includes(
                            Number(featuredMovies[currentSlide].id)
                          )
                            ? "In Watchlist"
                            : "Add to Watchlist"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-red-500 scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <Sparkles className="h-6 w-6 text-red-400" />
            <h3 className="text-2xl font-bold text-white">
              AI Recommendations for You
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aiRecommendedMovies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedMovie(movie);
                }}
              >
                <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-yellow-400">
                        {parseFloat(`${movie.rating}`).toPrecision(2)}
                      </span>
                      <span className="text-slate-300">{movie.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies, directors, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Genre Filter */}
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(0, 6).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedGenre === genre
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>More</span>
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="trending">Trending</option>
                <option value="rating">Rating</option>
                <option value="year">Year</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex flex-wrap gap-2">
                  {GENRES.slice(6).map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedGenre === genre
                          ? "bg-red-500 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">
              {searchTerm ? `Search Results for "${searchTerm}"` : "All Movies"}
              <span className="text-slate-400 text-lg font-normal ml-2">
                ({filteredAndSortedMovies.length} movies)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <div
                onClick={() => navigate(`/movie/${movie.id}`)}
                key={movie.id}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-80 object-cover"
                    onClick={() => setSelectedMovie(movie)}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {movie.trending && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </span>
                    )}
                    {movie.aiRecommended && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Pick
                      </span>
                    )}
                  </div>

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedMovie(movie)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Play className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(Number(movie.id));
                        }}
                        className={`p-3 backdrop-blur-sm rounded-full transition-colors ${
                          watchlist.includes(Number(movie.id))
                            ? "bg-red-500/80 hover:bg-red-600/80"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        <Plus className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-yellow-400">
                          {parseFloat(`${movie.rating}`).toPrecision(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Clock className="h-3 w-3" />
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                    {/* <div className="flex flex-wrap gap-1 mt-2">
                      {movie.genre.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 bg-slate-700/80 text-slate-300 text-xs rounded"
                        >
                          {g}
                        </span>
                      ))}
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedMovies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-xl mb-4">No movies found</div>
              <p className="text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full h-96 md:h-full object-cover rounded-l-2xl"
                  />
                </div>

                <div className="md:w-2/3 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedMovie.title}
                      </h2>
                      <p className="text-slate-300 text-lg mb-4">
                        {selectedMovie.year} • {selectedMovie.duration}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 font-semibold">
                        {selectedMovie.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedMovie.genre.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-lg"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {selectedMovie.description}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-white font-semibold mb-2">
                        Director
                      </h4>
                      <p className="text-slate-300">{selectedMovie.director}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Cast</h4>
                      <p className="text-slate-300">
                        {selectedMovie.cast.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/watch?v=${selectedMovie.trailer}`,
                          "_blank"
                        )
                      }
                    >
                      <Play className="h-5 w-5" />
                      <span>Watch Trailer</span>
                    </button>
                    <button
                      onClick={() => toggleWatchlist(Number(selectedMovie.id))}
                      className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 ${
                        watchlist.includes(Number(selectedMovie.id))
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      <Plus className="h-5 w-5" />
                      <span>
                        {watchlist.includes(Number(selectedMovie.id))
                          ? "In Watchlist"
                          : "Add to Watchlist"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
