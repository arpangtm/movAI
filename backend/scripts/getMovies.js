const TMDB_TOKEN = process.env.TMDB_API_KEY;

let genreMap = {};

const getMovieDetailsByTitleAndYear = async (recommendations) => {
  const results = [];
  console.log("recommendation", recommendations);
  for (let i = 0; i < recommendations.length; i++) {
    const { name, releaseYear } = recommendations[i];

    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        name
      )}&year=${releaseYear}`,
      {
        headers: {
          Authorization: TMDB_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    const searchData = await searchRes.json();
    const movie = searchData.results?.[0];
    if (!movie) continue;

    const movieId = movie.id;

    const detailsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      {
        headers: {
          Authorization: TMDB_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
      {
        headers: {
          Authorization: TMDB_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    const trailerKey = await getTrailer(movieId);

    const details = await detailsRes.json();
    console.log("detailsRes", details);

    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      {
        headers: {
          Authorization: TMDB_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    const credits = await creditsRes.json();

    const cast = credits.cast?.slice(0, 3).map((c) => c.name) || [];
    const director =
      credits.crew?.find((c) => c.job === "Director")?.name || "Unknown";

    const runtime = details.runtime;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    const duration = `${hours}h ${minutes}m`;

    const genre = details.genres?.map((g) => g.name) || [];

    const poster = details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : "";

    results.push({
      id: movieId,
      title: details.title,
      year: parseInt(details.release_date?.split("-")[0]) || releaseYear,
      rating: details.vote_average,
      genre,
      director,
      duration,
      poster,
      description: details.overview,
      cast,
      trending: details.popularity > 50,
      aiRecommended: true,
      trailer: trailerKey,
    });
  }

  return results;
};

const getTrendingMovies = async () => {
  const response = await fetch(
    "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
    {
      headers: {
        Authorization: TMDB_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  if (Object.keys(genreMap).length === 0) {
    genreMap = await fetchGenreMap();
  }
  console.log("genreMap", genreMap);
  data.results.forEach((m) => {
    m.genre = m.genre_ids.map((id) => genreMap[id]);
  });
  console.log("trending", data.results);

  return data.results;
};

const fetchGenreMap = async () => {
  if (Object.keys(genreMap).length > 0) return genreMap;

  const res = await fetch(
    "https://api.themoviedb.org/3/genre/movie/list?language=en",
    {
      headers: {
        Authorization: TMDB_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  data.genres.forEach((g) => {
    genreMap[g.id] = g.name;
  });

  return genreMap;
};

const searchMoviesByTitle = async (title) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${title}`,
    {
      headers: {
        Authorization: TMDB_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();

  const top5 = (data.results || [])
    .filter((movie) => movie.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 7);
  top5.forEach((m) => {
    m.genre = m.genre_ids.map((id) => genreMap[id]);
  });

  return top5;
};

const getTrailer = async (movieId) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
    {
      headers: {
        Authorization: TMDB_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  console.log("data", data);
  const trailer = data.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );
  console.log("trailer", trailer?.key);

  return trailer?.key;
};

module.exports = {
  getMovieDetailsByTitleAndYear,
  getTrendingMovies,
  searchMoviesByTitle,
  getTrailer,
};
