# Interviewly

A two phase interview practice app built with Next.js. Users provide a job description and resume, answer behavioral and technical questions by voice or text, and receive feedback and a final report.

The public landing page is at `/`, account access is at `/login`, and the interview is at `/interview`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Add `GEMINI_API_KEY` to `.env.local` for AI generated questions and feedback. The default model is `gemini-3.5-flash-lite`; change `GEMINI_MODEL` if needed. An optional OpenAI provider remains available through `OPENAI_API_KEY`; Gemini takes priority when both keys are set. Without a working key or when the provider fails, the app displays an error rather than invented questions or feedback.

## Free account authentication

Create a free Supabase project. In its dashboard, copy the Project URL and **publishable** API key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never use a Supabase secret or service role key in `NEXT_PUBLIC_` variables. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local email confirmation, and add `http://localhost:3000/auth/confirm` to the project's allowed redirect URLs. Email/password sign-up, confirmation, login, and logout are then available. When hosted later, update the site URL and allowed redirect URL to the real domain.

Without Supabase configuration, development mode offers a clearly labeled local preview of `/interview`. Production mode requires authentication configuration and does not expose the interview or its API routes. The sign-in flow has not been live-tested against a Supabase project yet because no project credentials have been configured.

## Features

- Paste a job description and resume, or upload a PDF, DOCX, or TXT resume (5 MB limit).
- Three behavioral questions followed by three technical questions.
- Browser text to speech for spoken questions, and browser speech recognition for spoken answers where supported. Text entry is always available.
- Optional question timer that can be paused or turned off.
- Feedback after each answer and a summary report with strengths and improvement areas.
- A coding question in the technical round. When a coding pattern gap is identified, the report links to curated LeetCode problems for that pattern. Links come from a fixed reviewed catalog, not AI-generated URLs.
- Retry any answer after feedback and compare your next attempt.
- Opt in to save completed reports and answers in this browser, review past sessions, or delete them. Resumes are never stored in browser history.

## Deploy to Vercel

When you choose to deploy, import the GitHub repository in Vercel. It detects Next.js automatically. Configure the Supabase project URL, publishable key, and site URL, then set `GEMINI_API_KEY` in the project's environment variables to enable AI personalization. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`. The Gemini key stays on the server and is never sent to the browser. No Vercel deployment has been made yet.

The in-progress interview stays in browser memory; reloading starts a new session. Completed reports are saved in browser local storage only when the user enables history, and can be deleted from the history panel. Resume text is never saved in browser history. Resume text and answers go to the app's server for extraction and feedback. When AI is enabled, the server sends the job description, resume, and relevant answer to the configured AI provider. Google's free API tier has model-specific limits and may use free-tier content to improve its products; review its terms before sending real resumes.
