# Interviewly

A two phase interview practice app built with Next.js. Users provide a job description and resume, answer behavioral and technical questions by voice or text, and receive feedback and a final report.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Add `OPENAI_API_KEY` to `.env.local` for AI generated questions and feedback. Without a key, the app uses built in question templates and simple answer heuristics so the full flow can still be tried. The UI does not claim that heuristic feedback is AI evaluation.

## Features

- Paste a job description and resume, or upload a PDF, DOCX, or TXT resume (5 MB limit).
- Three behavioral questions followed by three technical questions.
- Browser text to speech for spoken questions, and browser speech recognition for spoken answers where supported. Text entry is always available.
- Optional question timer that can be paused or turned off.
- Feedback after each answer and a summary report with strengths and improvement areas.

## Deploy to Vercel

Import the GitHub repository in Vercel. It detects Next.js automatically. Set `OPENAI_API_KEY` in the project's environment variables to enable AI personalization. `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`. Deploy. The OpenAI key stays on the server and is never sent to the browser.

The app stores interview state only in browser memory. Reloading the page starts a new session. Resume text and answers are sent to the app's server for extraction and feedback. With an OpenAI key set, the server sends the job description, resume, and relevant answer to OpenAI.
