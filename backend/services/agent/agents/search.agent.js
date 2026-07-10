import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  await checkAgentLimit(state.userId, "search");
  await deductCredits(state.userId, "search");

  // Tavily search has been removed.
  return {
    ...state,
    searchResults: []
  };
};