# Zain Durani AI

A responsive Next.js AI chat application with local chat history, markdown rendering, copy/retry, streaming responses through Groq, and Gemini provider support.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- An API key for either Groq or Gemini (availability, pricing and quotas are controlled by the provider)

## Setup (Windows)
1. Extract the ZIP folder.
2. Install Node.js LTS from https://nodejs.org if needed.
3. Open the project folder in VS Code.
4. Open Terminal and run `npm install`.
5. Copy `.env.example` to `.env.local`.
6. Configure one provider in `.env.local`:

### Groq (OpenAI-compatible API)
Create a key at https://console.groq.com/keys and set:
```
AI_PROVIDER=groq
GROQ_API_KEY=your_secret_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### Gemini
Create a key at https://aistudio.google.com/app/apikey and set:
```
AI_PROVIDER=gemini
GEMINI_API_KEY=your_secret_key
GEMINI_MODEL=gemini-2.5-flash
```

7. Save `.env.local` and run `npm run dev`.
8. Visit http://localhost:3000.

## Notes
- API keys are only read server-side and must not be placed in client code or committed.
- Groq response streaming is handled as server-sent events; Gemini currently returns the response as a plain text response (non-streaming).
- Chat history is stored locally in this browser, not in a cloud account. Clearing browser storage removes it.
- This starter does not include authentication, database persistence, live web search, file uploads, or user-management.
- Provider free quotas, access and pricing change; verify them directly before use.
