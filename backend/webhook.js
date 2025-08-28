require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Webhook } = require("svix");
const {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { requireAuth, getAuth, clerkClient } = require("@clerk/express");
const { clerkMiddleware } = require("@clerk/express");
const cors = require("cors");
const {
  getMovieDetailsByTitleAndYear,
  getTrendingMovies,
  searchMoviesByTitle,
  getTrailer,
} = require("./scripts/getMovies.js");
const { getOpenRouterResponse } = require("./scripts/LLM.js");

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: ["https://mov-ai.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(clerkMiddleware());

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/user_register_webhook", async (req, res) => {
  console.log("Hit /user_register_webhook");
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  const headers = req.headers;

  try {
    const evt = wh.verify(JSON.stringify(req.body), {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    if (evt.type === "user.created") {
      const { id, email_addresses, image_url, username, first_name } = evt.data;
      const { v4: uuidv4 } = require("uuid");

      const userId = uuidv4();
      const params = {
        TableName: "UserData",
        Item: marshall({
          ClerkID: id,
          userId: userId,
          Email: email_addresses[0].email_address,
          Username: username,
          Name: first_name,
          Picture: image_url,
        }),
      };

      await dynamoDB.send(new PutItemCommand(params));
      res.status(200).json({ success: true });
    } else if (evt.type === "user.updated") {
      const { id, email_addresses, image_url, username, first_name } = evt.data;
      const { v4: uuidv4 } = require("uuid");

      const userId = uuidv4();

      const params = {
        TableName: "UserData",
        Item: marshall({
          ClerkID: id,
          userId: userId,
          Email: email_addresses[0].email_address,
          Username: username,
          Name: first_name,
          Picture: image_url,
        }),
      };

      await dynamoDB.send(new PutItemCommand(params));
      res.status(200).json({ success: true, message: "User updated" });
    }
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).json({ error: "Invalid webhook" });
  }
});

app.get("/test", (req, res) => {
  res.status(200).send("Test successful");
});

app.get("/health-check", async (req, res) => {
  try {
    const params = {
      TableName: "UserData",
      Limit: 1,
    };

    const command = new ScanCommand(params);
    const data = await dynamoDB.send(command);

    res.status(200).send("DynamoDB connection OK");
  } catch (err) {
    console.error("DynamoDB connection failed:", err);
    res.status(500).send("DynamoDB connection FAILED");
  }
});

app.post("/user-interests", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  //Put into dynamodb
  const body = req.body;
  console.log(body);
  const params = {
    TableName: "UserData",
    Item: marshall({
      ClerkID: userId,
      Interests: {
        ...body,
      },
    }),
  };
  try {
    await dynamoDB.send(new PutItemCommand(params));
    res.status(200).json({ success: true, message: "Interests updated" });
  } catch (err) {
    console.error("DynamoDB connection failed:", err);
    res.status(500).send("DynamoDB connection FAILED");
  }
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ message: `Hello, user ${userId}` });
});

app.get("/featured", requireAuth(), async (req, res) => {
  console.log("Hit /featured");
  const { userId } = getAuth(req);
  const params = {
    TableName: "UserData",
    Key: { userId },
    ProjectionExpression: "Recommendations",
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamoDB.send(command);

    if (!data.Item || !data.Item.Recommendations) {
      console.log("No recommendations found.");
      return [];
    }

    const recommendations = data.Item.Recommendations;
    const movies = await getMovieDetailsByTitleAndYear(recommendations);
    console.log("New movies");
    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return [];
  }
});

app.get("/trending", requireAuth(), async (req, res) => {
  console.log("Hit /trending");
  const movies = await getTrendingMovies();
  res.status(200).json(movies);
});

app.post("/search-movies", async (req, res) => {
  const { searchTerm } = req.body;
  console.log("searchTerm", searchTerm);
  const movies = await searchMoviesByTitle(searchTerm);
  res.status(200).json(movies);
});

app.post("/watchlist", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { movieId, action } = req.body;

  if (!movieId || !action) {
    return res.status(400).send("Missing movieId or action");
  }

  const tableName = "UserData";

  let params;

  if (action === "add") {
    params = {
      TableName: tableName,
      Key: { userId },
      UpdateExpression:
        "SET watchlist = list_append(if_not_exists(watchlist, :empty), :movie)",
      ExpressionAttributeValues: {
        ":movie": [movieId],
        ":empty": [],
      },
      ReturnValues: "UPDATED_NEW",
    };
  } else if (action === "remove") {
    // Fetch current watchlist first
    const getParams = {
      TableName: tableName,
      Key: { userId },
    };

    try {
      const getCommand = new GetCommand(getParams);
      const data = await dynamoDB.send(getCommand);
      const watchlist = data.Item?.watchlist || [];

      const updatedwatchlist = watchlist.filter((id) => id !== movieId);

      params = {
        TableName: tableName,
        Key: { userId },
        UpdateExpression: "SET watchlist = :updated",
        ExpressionAttributeValues: {
          ":updated": updatedwatchlist,
        },
        ReturnValues: "UPDATED_NEW",
      };
    } catch (err) {
      console.error("Error reading watchlist:", err);
      return res.status(500).send("Failed to read watchlist");
    }
  } else {
    return res.status(400).send("Invalid action");
  }

  try {
    const command = new UpdateCommand(params);
    const result = await dynamoDB.send(command);
    res.status(200).json(result.Attributes);
  } catch (err) {
    console.error("watchlist update failed:", err);
    res.status(500).send("Server error");
  }
});

app.get("/watchlist", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  const params = {
    TableName: "UserData",
    Key: { userId },
    ProjectionExpression: "watchlist",
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamoDB.send(command);
    res.status(200).json({ watchlist: data.Item?.watchlist || [] });
  } catch (err) {
    console.error("Error fetching watchlist:", err);
    res.status(500).send("Server error");
  }
});

app.get("/watchlist-data", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  console.log("userId", userId);
  // Step 1: Get watchlist from DynamoDB
  const getParams = {
    TableName: "UserData",
    Key: { userId },
    ProjectionExpression: "watchlist",
  };

  try {
    const command = new GetCommand(getParams);
    const data = await dynamoDB.send(command);
    const watchlist = data.Item?.watchlist || [];

    // Step 2: Fetch movie details from TMDB
    const movieDetails = await Promise.all(
      watchlist.map(async (movieId) => {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
          {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZTllOGE2MjczMjEzMjkxNmZhMmEyMDAxNzk2OTE2MyIsIm5iZiI6MTc1NDI4MTQzOS4wMTgsInN1YiI6IjY4OTAzNWRmZmQ3NmIyZDM5OWIyMzNkOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2c4Ot2dJynPmdQ_Rbkf8cilUsoxhCysnDT4zrleDJhU",
              "Content-Type": "application/json",
            },
          }
        );
        const details = await response.json();

        return {
          id: details.id,
          title: details.title,
          year: parseInt(details.release_date?.split("-")[0]) || 0,
          rating: details.vote_average,
          genre: details.genres?.map((g) => g.name) || [],
          director: "Unknown", // You can fetch credits separately if needed
          duration: `${Math.floor(details.runtime / 60)}h ${
            details.runtime % 60
          }m`,
          poster: details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : "",
          description: details.overview,
          cast: [], // Optional: fetch credits if needed
          trending: details.popularity > 50,
          aiRecommended: true,
        };
      })
    );

    console.log("movieDetails", movieDetails);
    res.status(200).json({ watchlist: movieDetails });
  } catch (err) {
    console.error("Error fetching watchlist:", err);
    res.status(500).send("Server error");
  }
});

app.get("/movie/:id/full", async (req, res) => {
  const movieId = req.params.id;

  try {
    // Fetch movie details
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
      {
        headers: {
          Authorization: process.env.TMDB_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!movieRes.ok) throw new Error("Failed to fetch movie details");
    const movieData = await movieRes.json();
    const trailer = await getTrailer(movieId);
    console.log("trailer", trailer);

    // Fetch movie credits
    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
      {
        headers: {
          Authorization: process.env.TMDB_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const creditsData = creditsRes.ok ? await creditsRes.json() : null;

    const transformedMovie = {
      id: movieData.id,
      title: movieData.title,
      year: parseInt(movieData.release_date?.split("-")[0]) || 0,
      rating: movieData.vote_average,
      genre: movieData.genres?.map((g) => g.name) || [],
      director:
        creditsData?.crew?.find((person) => person.job === "Director")?.name ||
        "Unknown",
      duration: movieData.runtime
        ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m`
        : "",
      poster: movieData.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
        : "",
      backdrop: movieData.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
        : "",
      description: movieData.overview,
      cast: creditsData?.cast?.slice(0, 10).map((actor) => actor.name) || [],
      trending: movieData.popularity > 50,
      budget: movieData.budget,
      revenue: movieData.revenue,
      status: movieData.status,
      tagline: movieData.tagline,
      trailer: trailer,
    };

    res.status(200).json(transformedMovie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ error: err.message });
  }
});

const checkOnboarding = async (req, res, next) => {
  const { userId } = getAuth(req);
  console.log(userId);
  const params = {
    TableName: "UserData",
    Key: { userId },
    ProjectionExpression: "onboarded",
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamoDB.send(command);

    const onboarded = data.Item?.onboarded ?? false;

    if (onboarded === true) {
      return res.status(403).json({ error: "User already onboarded" });
    }

    next(); // ✅ Allow access to onboarding route
  } catch (err) {
    console.error("Error checking onboarding status:", err);
    res.status(500).json({ error: "Server error" });
  }
};

app.post("/onboarding", requireAuth(), checkOnboarding, async (req, res) => {
  // Proceed with onboarding logic
  res.status(200).json({ message: "Onboarding allowed" });
});

app.post("/api/recommend", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  console.log("userid", userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userMessage: message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing user message" });
  }

  try {
    const recommendations = await getOpenRouterResponse(message);
    console.log("recommendations", recommendations);
    res.json(recommendations);
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
