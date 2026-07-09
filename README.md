# AKX AI

Full-stack AI chat application with multi-agent capabilities — chat, coding, web search, PDF, PPT, image generation, and more.

## Quick Start

```bash
# Install dependencies
npm run install:all

# Start MongoDB (required)
# mongod or docker

# Optional: Redis for persistent sessions
cd backend && docker compose up -d

# Run the complete app
npm run dev
```

Open **http://localhost:3000** in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + all backend services |
| `npm run build` | Production frontend build |
| `npm run start` | Production mode (gateway serves app on :3000) |
| `npm run lint` | ESLint |

## Architecture

- **Frontend** — React + Vite on `http://localhost:3000`
- **API Gateway** — Internal `:8000`, proxied via Vite
- **Services** — Auth (`8001`), Chat (`8002`), Agent (`8003`), Billing (`8004`)

See `.env.example` for environment variables.

## Enable AI Chat (Required)

Chat requires an OpenAI-compatible API key. Add **one** of these to `backend/services/agent/.env`:

```env
# Recommended — OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini

# Or Groq (OpenAI-compatible)
GROQ_API_KEY=gsk_your-key-here

# Or OpenRouter
OPENROUTER_API_KEY=sk-or-your-key-here
```

Restart after updating: `npm run dev`

## License

Private — AKX AI
