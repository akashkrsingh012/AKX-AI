import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY?.trim();

export const embeddings = apiKey
  ? new OpenAIEmbeddings({
      apiKey,
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    })
  : null;

export function getEmbeddings() {
  if (!embeddings) {
    throw new Error(
      "OPENAI_API_KEY is required for PDF embeddings. Set it in backend/services/agent/.env"
    );
  }
  return embeddings;
}
