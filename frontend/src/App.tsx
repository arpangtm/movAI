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
import MovieSignInPopup from "./components/signin-popup";
import MovieFeatureBanner from "./components/ai-recommendation";

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
    getTrendingMovies();
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
    if (!debouncedSearchTerm) {
      return;
    }
    searchMovies();
  }, [debouncedSearchTerm]);

  useEffect(() => {}, [selectedMovie]);

  useEffect(() => {
    if (!token) {
      return;
    }
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
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/search-movies`,
      {
        // const res = await fetch("http://localhost:3001/search-movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify({
          searchTerm: debouncedSearchTerm,
        }),
      }
    );
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
        `${import.meta.env.VITE_BACKEND_URL}/watchlist`,
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
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/featured`, {
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
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trending`, {
      // const res = await fetch("http://localhost:3001/trending", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
    });

    const data = await res.json();
    console.log(data);
    if (!token) {
      setFeaturedMovies(data.slice(0, 4));
      setMovies(data.slice(4));
      return;
    }

    //Set remaining trending movies
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black">
      <Navbar />

      {!token && <MovieSignInPopup />}

      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] overflow-hidden">
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
                  src={
                    movie.poster ||
                    `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Professional Dark Red Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
                  <div className="max-w-3xl">
                    {/* Badges */}
                    <div className="flex items-center space-x-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                      <div className="inline-flex items-center space-x-2 bg-red-600/90 backdrop-blur-md border border-red-500/50 rounded-full px-4 py-1.5 shadow-lg shadow-red-900/20">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                        <span className="text-white text-xs font-bold tracking-wider uppercase">
                          Featured Premiere
                        </span>
                      </div>
                      {movie.trending && (
                        <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full px-4 py-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-amber-300 text-xs font-bold tracking-wider uppercase">
                            Trending #1
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Movie Title */}
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 drop-shadow-2xl">
                      {movie.title}
                    </h1>

                    {/* Movie Info */}
                    <div className="flex items-center space-x-6 mb-8 text-zinc-300 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                      <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white font-bold">
                          {parseFloat(`${movie.rating}`).toPrecision(2)}
                        </span>
                      </div>
                      <span className="font-medium">{movie.year}</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{movie.duration}</span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-zinc-500" />
                      <span className="px-2 py-0.5 border border-zinc-600 rounded text-xs font-bold text-zinc-400 uppercase">
                        HD
                      </span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
                      {movie.genre.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-zinc-200 text-sm font-medium rounded-full hover:bg-white/10 transition-colors cursor-default"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-zinc-300 z-10 mb-10 line-clamp-3 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
                      {movie.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-14 duration-700 delay-600">
                      <button
                        onClick={() => {
                          setSelectedMovie(featuredMovies[currentSlide]);
                        }}
                        className="group flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
                      >
                        <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                        <span>Watch Trailer</span>
                      </button>
                      
                      <button
                        onClick={() =>
                          toggleWatchlist(
                            Number(featuredMovies[currentSlide].id)
                          )
                        }
                        className={`flex items-center space-x-3 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-md border ${
                          watchlist.includes(
                            Number(featuredMovies[currentSlide].id)
                          )
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                        }`}
                      >
                        <Plus className={`h-5 w-5 ${watchlist.includes(Number(featuredMovies[currentSlide].id)) ? "rotate-45" : ""} transition-transform duration-300`} />
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 group"
        >
          <ChevronLeft className="h-8 w-8 text-white/70 group-hover:text-white transition-colors" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 group"
        >
          <ChevronRight className="h-8 w-8 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "w-8 bg-red-600"
                  : "w-2 bg-white/30 hover:bg-white/50"
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
          {!token && <MovieFeatureBanner />}
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
      <section className="px-4 sm:px-6 lg:px-8 mb-12 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/50">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search movies, directors, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition-all"
                />
              </div>

              {/* Genre Filter */}
              <div className="flex flex-wrap gap-2 items-center">
                {GENRES.slice(0, 6).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedGenre === genre
                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 border ${
                    showFilters
                      ? "bg-zinc-700 border-white/10 text-white"
                      : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>More</span>
                </button>
              </div>

              {/* Sort */}
              <div className="relative min-w-[140px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 cursor-pointer"
                >
                  <option value="trending">Trending</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                  <option value="title">Title</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex flex-wrap gap-2">
                  {GENRES.slice(6).map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedGenre === genre
                          ? "bg-red-600 border-red-500 text-white shadow-lg"
                          : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-white/10"
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
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {searchTerm ? `Search Results` : "Explore Movies"}
              </h3>
              <p className="text-zinc-400 mt-1">
                {filteredAndSortedMovies.length} {filteredAndSortedMovies.length === 1 ? 'title' : 'titles'} available
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <div
                onClick={() => navigate(`/movie/${movie.id}`)}
                key={movie.id}
                className="group relative bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10"
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onClick={() => setSelectedMovie(movie)}
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {movie.trending && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow-lg">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        TRENDING
                      </span>
                    )}
                    {movie.aiRecommended && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-black shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI PICK
                      </span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(movie);
                        }}
                        className="p-3.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-red-600 text-white transition-colors border border-white/20 hover:border-red-500"
                      >
                        <Play className="h-6 w-6 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(Number(movie.id));
                        }}
                        className={`p-3.5 backdrop-blur-md rounded-full transition-colors border ${
                          watchlist.includes(Number(movie.id))
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                        }`}
                      >
                        <Plus className={`h-6 w-6 ${watchlist.includes(Number(movie.id)) ? "rotate-45" : ""} transition-transform duration-300`} />
                      </button>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-1">
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold">{parseFloat(`${movie.rating}`).toPrecision(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedMovies.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-zinc-900/50 p-8 rounded-full inline-block mb-6 ring-1 ring-white/10">
                <Search className="h-12 w-12 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
              <p className="text-zinc-400">
                We couldn't find any movies matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="md:flex">
              <div className="md:w-2/5 relative">
                <div className="aspect-[2/3] md:h-full">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
                </div>
              </div>

              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {selectedMovie.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-zinc-300">
                    <span className="px-2 py-1 bg-white/10 rounded text-sm font-semibold text-white">{selectedMovie.year}</span>
                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Star className="h-4 w-4 fill-current" />
                      {selectedMovie.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedMovie.duration}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedMovie.genre.map((g) => (
                    <span
                      key={g}
                      className="px-4 py-1.5 bg-zinc-800 border border-white/5 text-zinc-300 text-sm font-medium rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-zinc-300 text-lg leading-relaxed mb-8 border-l-4 border-red-600 pl-4">
                  {selectedMovie.description}
                </p>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <h4 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Director</h4>
                    <p className="text-white font-medium text-lg">{selectedMovie.director}</p>
                  </div>
                  <div>
                    <h4 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Cast</h4>
                    <p className="text-white font-medium text-lg line-clamp-1">{selectedMovie.cast.join(", ")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(
                        `https://www.youtube.com/watch?v=${selectedMovie.trailer}`,
                        "_blank"
                      )
                    }
                  >
                    <Play className="h-5 w-5 fill-current" />
                    <span>Watch Trailer</span>
                  </button>
                  <button
                    onClick={() => toggleWatchlist(Number(selectedMovie.id))}
                    className={`px-6 rounded-xl font-bold transition-all hover:scale-[1.02] border flex items-center gap-2 ${
                      watchlist.includes(Number(selectedMovie.id))
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <Plus className={`h-5 w-5 ${watchlist.includes(Number(selectedMovie.id)) ? "rotate-45" : ""} transition-transform`} />
                  </button>
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
