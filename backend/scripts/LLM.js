import OpenAI from "openai";
const apiKey = process.env.OPENROUTER_API_KEY;

export async function getOpenRouterResponse(userMessage) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://moviedb.arpangautam.com",
      "X-Title": "MovieDB",
    },
    dangerouslyAllowBrowser: true,
  });
  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages: [
      {
        role: "system",
        content: `You are a knowledgeable and enthusiastic movie/tv shows/webseries recommendation agent. Your name is CineBot. You have extensive knowledge of films across all genres, eras, and cultures. User's message: "${userMessage}" Please provide movie recommendations that match their request. Include: - Movie titles with release years - Brief compelling descriptions (1-2 sentences each) - Why you think they'd enjoy it based on their request - Mix of popular and hidden gem recommendations when appropriate - Use movie and entertainment emojis to make it engaging give me total of 4 movies/tv shows/webseries with the link to where i can watch each movie, tv show, or webseries. Output format should be in JSON format with the following structure: { "recommendations": [ { "title": "Content Title", "year": 2023, "reason": "Explanation for why this content is recommended.Make this very short and to the point", "genre": "the main genre of the content", "link": "imdb link to this content" }, ... ] } The response should only be strictly in JSON format and nothing else! Only plain texts no images or other unicode characters. If you have no recommendation give me empty JSON object! The response should only be json of recommendations`,
      },
      { role: "user", content: userMessage },
    ],
  });
  if (!completion.choices[0].message.content) {
    return { recommendations: [] };
  }

  try {
    const recommendations = JSON.parse(completion.choices[0].message.content);

    return recommendations;
  } catch (error) {
    return { recommendations: [] };
  }
}
