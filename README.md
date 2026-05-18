# PitchAssess

AI-powered pitch deck assessment for deep-tech startups. Upload a PDF or audio
recording of your pitch, pick your target audience (VC, tech-transfer office,
funding agency, etc.), and get a weighted score across 10 categories plus
structured feedback (strengths, improvements, recommendations) in English,
Polish, German, or Lithuanian.

## Stack

- **Frontend:** React 18 + Vite + Tailwind + Redux Toolkit + react-i18next
- **Backend:** [PocketBase](https://pocketbase.io) — single-binary SQLite-based
  BaaS (auth, DB, file storage, JS hooks)
- **AI:**
  - OpenRouter (`openai/gpt-4o`) for pitch analysis and pitch generation
  - OpenAI Whisper (`whisper-1`) for audio/video transcription
- **PDF parsing:** pdf.js (client-side, off-main-thread worker)
- **Tests:** Vitest

API keys live only on the PocketBase server. The frontend talks to PocketBase
proxy endpoints (`/api/proxy/openrouter`, `/api/proxy/whisper`); upstream calls
happen server-side so the keys never reach the browser bundle.

## Quick start

```bash
git clone https://github.com/eriksonas/pitch-assess.git
cd pitch-assess
npm install
cp .env.example .env
# Edit .env and paste your real OPENROUTER_API_KEY and OPENAI_API_KEY
```

Then in one terminal:

```bash
./start-pocketbase.sh   # backend on http://127.0.0.1:8090
```

And in another:

```bash
npm start               # frontend on http://localhost:4028
```

Open http://localhost:4028 in a browser, sign up, and run your first
assessment.

On first launch PocketBase auto-creates a superuser setup link in its
log. Open it to set the admin password, or skip the admin UI entirely
if you only need to use the app.

Detailed deployment instructions for production are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Project layout

```
.
├── src/                    React frontend
│   ├── pages/              Route pages (dashboard, processing, results, ...)
│   ├── components/         Shared UI + navigation + ErrorBoundary
│   ├── services/           PocketBase data access + OpenRouter client + scoring
│   ├── contexts/           AuthContext (PB session)
│   ├── lib/pb.js           PocketBase client
│   └── i18n/               en / pl / de / lt translations
├── pocketbase/
│   ├── pb_migrations/      Collection schema (auto-applied on startup)
│   ├── pb_hooks/           Server-side JS — currently the AI proxy
│   └── pocketbase          Binary (gitignored, downloaded separately)
├── start-pocketbase.sh     Loads .env, then runs pocketbase serve
└── supabase/migrations/    Legacy — original Supabase schema, kept for reference
```

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Vite dev server on :4028 |
| `npm run build` | Production build into `build/` |
| `npm run serve` | Preview the production build |
| `npm test` | Run Vitest unit tests once |
| `npm run test:watch` | Vitest in watch mode |
| `./start-pocketbase.sh` | Start PocketBase with `.env` loaded into its environment |

## How the assessment flow works

1. Sign in → upload a PDF (or mp3/wav/m4a/mp4 audio of you presenting)
2. Pick domain, target audience, and language
3. The file is uploaded to PocketBase storage; pdf.js (or Whisper for audio)
   extracts the text in the browser
4. The text plus an audience-specific rubric prompt is sent to
   `/api/proxy/openrouter`, which adds the server-side key and forwards to
   OpenRouter
5. GPT-4o returns per-category scores (1–10) plus structured feedback;
   the client computes the weighted total deterministically
6. Results are written back to PocketBase and shown on the comprehensive
   results page (overview, strengths, improvements, detailed analysis,
   recommendations)

The audience-weighted scoring rubric is in
[`src/services/scoring.js`](src/services/scoring.js).

## Tested

```
npm test
```

Currently covers the pure scoring/transform logic (8 tests). The pattern
is established under `src/services/__tests__/`; extend it by extracting
pure logic from larger services.

## Known limits

- **Whisper 25 MB cap.** Long audio recordings need to be re-encoded
  (e.g. 64 kbps mono mp3 keeps ~50 min within budget). Chunking is not
  implemented.
- **No OCR.** Image-only / scanned PDFs return a clear error rather than
  feeding the model junk.
- **No rate limits on the proxy.** PocketBase's JS hook engine creates a
  fresh runtime per request, so in-memory limits don't persist. The proxy
  is auth-gated (`$apis.requireAuth("users")`), so abuse is bounded to
  authenticated accounts. For production, add a DB-backed counter or put
  nginx/Caddy in front.
- **Lithuanian translations** are working drafts, not native-reviewed.
- **No CI yet.** Tests run locally; nothing wired up to GitHub Actions.

## License

MIT — see [`LICENSE`](LICENSE).
