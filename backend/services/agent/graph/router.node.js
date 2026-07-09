const CODING_KEYWORDS = [
  "code",
  "coding",
  "debug",
  "function",
  "react",
  "javascript",
  "python",
  "api",
  "build app",
  "website",
  "program",
  "typescript",
  "html",
  "css",
  "sql",
  "algorithm",
  "bug",
  "error in",
  "implement",
];

const SEARCH_KEYWORDS = [
  "latest",
  "news",
  "today",
  "current",
  "recent",
  "search",
  "who is",
  "what happened",
  "2024",
  "2025",
  "2026",
  "price of",
  "weather",
];

const PDF_KEYWORDS = ["pdf", "document", "report"];
const PPT_KEYWORDS = ["ppt", "presentation", "slides", "powerpoint"];
const IMAGE_KEYWORDS = ["image", "picture", "photo", "draw", "generate art"];

function matchesAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

export const routerNode = async (state) => {
  // Uploaded files always take priority (image search / PDF Q&A).
  if (state.file?.mimetype?.startsWith("image/")) {
    return { ...state, agent: "vision" };
  }

  if (state.file?.mimetype === "application/pdf") {
    return { ...state, agent: "pdf_rag" };
  }

  if (state.agent && state.agent !== "auto") {
    return { ...state, agent: state.agent };
  }

  const text = (state.prompt || "").toLowerCase().trim();

  if (matchesAny(text, CODING_KEYWORDS)) {
    return { ...state, agent: "coding" };
  }
  if (matchesAny(text, SEARCH_KEYWORDS)) {
    return { ...state, agent: "search" };
  }
  if (matchesAny(text, PDF_KEYWORDS)) {
    return { ...state, agent: "pdf" };
  }
  if (matchesAny(text, PPT_KEYWORDS)) {
    return { ...state, agent: "ppt" };
  }
  if (matchesAny(text, IMAGE_KEYWORDS)) {
    return { ...state, agent: "image" };
  }

  return { ...state, agent: "chat" };
};
