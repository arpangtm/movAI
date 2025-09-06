import { jest } from "@jest/globals";
import { checkOnboarding } from "../src/scripts/onboarding";
import { error } from "console";

describe("checkOnboarding", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence console.error
  });
  test("Onboarding Required", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ok: true,
          }),
          {
            status: 200,
          }
        )
      )
    ) as jest.Mock;
    const onboarding = await checkOnboarding("Test Token");
    expect(onboarding).toEqual({ needsOnboarding: true });
  });

  test("Onboarding Not Required", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ok: true,
            status: 403,
          }),
          {
            status: 403,
          }
        )
      )
    ) as jest.Mock;
    const onboarding = await checkOnboarding("Test Token");
    expect(onboarding).toEqual({ needsOnboarding: false });
  });

  test("Onboarding Error", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ok: false,
            status: 500,
          }),
          {
            status: 500,
          }
        )
      )
    ) as jest.Mock;
    const onboarding = await checkOnboarding("Test Token");
    expect(onboarding).toEqual({ error: "Unexpected response: 500" });
  });
});
