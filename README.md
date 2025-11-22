# Epic Quest Generator

Turns everyday todos into 5-word heroic quests, with optional AI-suggested subtasks, all saved locally—no backend needed.

## Quick Start
1. `pnpm install`
2. Create `.env.local` with `OPENAI_API_KEY=sk-...`
3. `pnpm dev` → open http://localhost:3000

## Highlights
- GPT-4o mini rewrites tasks; GPT-4.1 mini can split any quest into 3–5 subtasks
- Local storage keeps progress between sessions
- Built with Next.js 16, React 19, Tailwind CSS 4, Radix UI, and shadcn/ui primitives
