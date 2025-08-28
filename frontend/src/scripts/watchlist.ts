const getWatchlist = async (token: string | null) => {
  try {
    const response = await fetch("https://movai-2gkg.onrender.com/watchlist", {
      // const response = await fetch("http://localhost:3001/watchlist", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch watchlist");
    const data = await response.json();
    return data.watchlist;
  } catch (err) {
    console.error("Error loading watchlist:", err);
  }
};

const updateWatchlist = async (
  token: string,
  movieId: number,
  action: "add" | "remove"
) => {
  if (!token) {
    console.error("Token not found");
    return;
  }

  // Sync with backend
  try {
    const response = await fetch("https://movai-2gkg.onrender.com/watchlist", {
      // const response = await fetch("http://localhost:3001/watchlist", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Make sure token is available
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieId, action }),
    });

    if (!response.ok) throw new Error("Failed to update watchlist");
    const data = await response.json();
  } catch (err) {
    console.error("Error syncing watchlist:", err);
  }
};

export { getWatchlist, updateWatchlist };
