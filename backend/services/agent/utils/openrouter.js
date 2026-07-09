import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ override: true });

export const callOpenRouter = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable");
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "AKX AI"
        }
      }
    );

    return response.data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("[OpenRouter] API Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error?.message || "OpenRouter API request failed");
  }
};
