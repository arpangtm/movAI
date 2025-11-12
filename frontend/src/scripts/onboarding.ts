type OnboardingCheckResult = { needsOnboarding: boolean } | { error: string };

const checkOnboarding = async (
  token: string
): Promise<OnboardingCheckResult> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/onboarding`, {
    // const response = await fetch("http://localhost:3001/onboarding", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 403) {
      return { needsOnboarding: false };
    } else if (!response.ok) {
      const errorText = await response.text();
      console.error("Unexpected response:", errorText);
      return { error: `Unexpected response: ${response.status}` };
    } else {
      return { needsOnboarding: true };
    }
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    } else {
      console.error("Unknown error:", err);
      return { error: "An unknown error occurred" };
    }
  }
};

const pollOnboardingStatus = async (
  token: string,
  intervalMs: number = 3000,
  maxAttempts: number = 10
): Promise<void> => {
  let attempts = 0;

  const poll = async () => {
    attempts++;

    const result = await checkOnboarding(token);

    if ("error" in result) {
      console.error("Polling error:", result.error);
      return;
    }

    if (!result.needsOnboarding) {
      window.location.href = "/";
      // You can redirect or update UI here
    }

    if (attempts < maxAttempts) {
      setTimeout(poll, intervalMs);
    } else {
      console.warn("Max polling attempts reached");
    }
  };

  poll();
};

export { pollOnboardingStatus, checkOnboarding };
