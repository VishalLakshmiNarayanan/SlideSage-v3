# Class Whisperer

Transform dense lecture text into engaging analogies, clear diagrams, and short explainer videos using AI.

## Features

- **Three Teaching Modes**: Analogy, Diagram/Steps, One-liner
- **Video Generation**: Create 30-60s animated explainer videos
- **Dark Glass UI**: Polished glass-morphism design
- **Groq Integration**: Powered by Groq's fast LLM API
- **Client-side Video**: Generate WebM videos in the browser

## Setup

1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Add your Groq API key to `.env.local`:
\`\`\`
GROQ_API_KEY=your_groq_api_key_here
\`\`\`

4. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to Vercel and set the `GROQ_API_KEY` environment variable in your project settings.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (Glass-morphism design)
- **Zustand** (State management)
- **Groq API** (AI text generation)
- **Canvas API** (Video generation)
- **Zod** (Schema validation)

## Notes

- WebM video export works best on Chrome-based browsers
- Rate limited to 10 requests per hour per IP
- Only uses Groq API - no other external services required
