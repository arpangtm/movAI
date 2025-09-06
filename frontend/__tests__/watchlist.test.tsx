import { getWatchlist, updateWatchlist } from "../src/scripts/watchlist";
import { jest } from "@jest/globals";

describe("getWatchlist", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true, status: 200, json: () => Promise.resolve({ test: 100 }) }))
      )
    ) as jest.Mock;
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("logs error if token is missing", async () => {
    await getWatchlist("");
    expect(console.error).toHaveBeenCalledWith("Token not found");
  });
});

describe("updateWatchlist", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true, status: 200, json: () => Promise.resolve({ test: 100 }) }))
      )
    ) as jest.Mock;
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("logs error if token is missing", async () => {
    await updateWatchlist("", 100, "add");
    expect(console.error).toHaveBeenCalledWith("Token not found");
  });

  
});