# Deployment

Deploying PitchAssess to a fresh server. Two services run side by side:

```
┌──────────────────────────────┐
│  Static frontend (Vite build)│  served by nginx / Caddy / etc.
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐      ┌─────────────────┐
│  PocketBase (single binary)  │ ───► │  OpenRouter API │
│  - Auth + SQLite DB          │ ───► │  OpenAI Whisper │
│  - File storage              │      └─────────────────┘
│  - JS hook proxy (/api/proxy)│
└──────────────────────────────┘
```

Both services run on the same host in the simplest deployment. PocketBase
holds the API keys; the frontend talks only to PocketBase.

---

## Prerequisites

- Linux host (anything Debian/Ubuntu/RHEL/Arch — PocketBase ships a Linux
  amd64 binary). Windows and macOS work too; the wrapper script assumes
  bash.
- **Node.js 18+** (for building the frontend)
- **OpenRouter account** with an API key — https://openrouter.ai/keys
- **OpenAI account** with an API key if you want audio/video transcription —
  https://platform.openai.com/api-keys
- A domain name + TLS cert for production (recommend Caddy for auto-cert
  via Let's Encrypt; nginx + certbot also fine)

---

## 1. Clone and install

```bash
git clone https://github.com/eriksonas/pitch-assess.git
cd pitch-assess
npm ci
```

## 2. Download PocketBase

The binary is gitignored — fetch it once into `pocketbase/`:

```bash
mkdir -p pocketbase && cd pocketbase
curl -L -o pb.zip \
  https://github.com/pocketbase/pocketbase/releases/download/v0.38.1/pocketbase_0.38.1_linux_amd64.zip
unzip pb.zip && rm pb.zip
chmod +x pocketbase
cd ..
```

Newer releases at https://github.com/pocketbase/pocketbase/releases — the
schema migration in `pocketbase/pb_migrations/` targets the v0.23+ JS API
and should keep working.

## 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and replace the two server-side placeholders with real keys:

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-proj-...
```

Anything prefixed `VITE_` is sent to the browser. Anything **without**
that prefix is server-only and read by `pocketbase/pb_hooks/proxy.pb.js`
via `$os.getenv()`. Do not put the API keys behind a `VITE_` prefix.

## 4. Apply schema and create a superuser

```bash
./pocketbase/pocketbase migrate up
./pocketbase/pocketbase superuser upsert you@example.com 'strong-password'
```

Migrations are auto-applied on `pocketbase serve` too, so the first call
is optional but explicit is nicer for deploys.

## 5. Build the frontend

```bash
npm run build
# output lands in build/
```

Vite reads `.env` for `VITE_*` variables at build time. Set
`VITE_PB_URL` to the **public URL** users will reach PocketBase at — e.g.
`https://api.example.com` — before running `npm run build`. The build
is static; you can serve it from any static host.

## 6. Run PocketBase

```bash
./start-pocketbase.sh
```

The wrapper sources `.env` and execs `pocketbase serve` with the keys in
its environment. By default it binds to `127.0.0.1:8090` (loopback only —
expects a reverse proxy in front). Change with `--http=0.0.0.0:8090` if
you're testing without TLS.

For long-running deploys, put it under a process supervisor — examples
below.

---

## Production hardening

These are the things you actually have to do before exposing this to the
internet. None are wired up by default.

### TLS and reverse proxy

Run a reverse proxy in front so PocketBase isn't exposed directly.
Minimal Caddy config:

```caddyfile
example.com {
    root * /var/www/pitch-assess/build
    file_server
    try_files {path} /index.html

    handle_path /api/* {
        reverse_proxy 127.0.0.1:8090
    }
    handle_path /_/* {
        reverse_proxy 127.0.0.1:8090
    }
}
```

This serves the frontend from `/build` and proxies `/api/*` and `/_/*`
(admin UI) to PocketBase.

Equivalent nginx is in the PocketBase docs:
https://pocketbase.io/docs/going-to-production/

### Trusted origins

In PocketBase admin UI → Settings → Application, set Trusted Origins to
your production domain(s). This blocks token use from rogue origins even
if a token leaks.

### Rate limiting

The proxy hook does not rate-limit beyond requiring auth. Add it at the
reverse proxy layer:

```caddyfile
@proxy path /api/proxy/*
rate_limit @proxy {
    zone /api/proxy 50r/h
}
```

Or use nginx `limit_req_zone`.

### Key rotation

Rotate `OPENROUTER_API_KEY` and `OPENAI_API_KEY` periodically:

1. Generate new key at the provider's dashboard
2. Replace the value in `/path/to/.env`
3. Restart PocketBase

No frontend rebuild required — the keys live only in PB's process env.

### Backup

`pocketbase/pb_data/` is the entire state — SQLite DB plus uploaded
files. Back it up:

```bash
# Simplest — coordinated stop+copy:
./pocketbase/pocketbase backup create

# Or via the admin UI: Settings → Backups
```

PocketBase backups go into `pocketbase/pb_data/backups/`. Sync them off
the host (rsync, S3, etc.) on a schedule.

---

## Process supervision

### systemd

```ini
# /etc/systemd/system/pitchassess-pb.service
[Unit]
Description=PitchAssess PocketBase
After=network.target

[Service]
Type=simple
User=pitchassess
WorkingDirectory=/var/www/pitch-assess
EnvironmentFile=/var/www/pitch-assess/.env
ExecStart=/var/www/pitch-assess/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now pitchassess-pb
```

Note `EnvironmentFile=` reads the `KEY=value` lines directly — no need
for the wrapper script under systemd.

### Docker

Not provided in-repo, but trivially:

```dockerfile
FROM debian:bookworm-slim
WORKDIR /app
COPY pocketbase/ ./pocketbase/
COPY .env ./
EXPOSE 8090
CMD ["./pocketbase/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

Pass keys via `--env-file .env` or Docker secrets.

---

## Troubleshooting

**Frontend shows "AI service is not configured on the server" (502/503)**
`OPENROUTER_API_KEY` is missing from PocketBase's environment. Check that
`start-pocketbase.sh` was used (or `EnvironmentFile` in systemd), and that
`.env` contains a real key.

**Frontend shows "Your session has expired"**
Browser's stored token has expired or PocketBase was wiped. Sign in
again. If you reset `pocketbase/pb_data/` you will need to recreate
accounts.

**"Failed to load assessment results — request was aborted"**
This was a known StrictMode-vs-SDK-autocancel bug that's been fixed by
disabling auto-cancellation in `src/lib/pb.js`. If you see it on a fresh
clone, rebuild after pulling latest.

**File upload silently does nothing**
PocketBase's body limit defaults to 32 MB. For larger pitch decks raise
the limit on the assessments collection (Admin UI → Collections →
assessments → file → Max file size).

**Whisper rejects an audio file**
25 MB hard cap from OpenAI. Re-encode at 64 kbps mono mp3 — `ffmpeg -i
input.mp4 -ac 1 -ab 64k output.mp3` typically fits ~50 minutes.

**Migration fails on a newer PocketBase version**
The schema migration uses the v0.23+ JS hook API. If PocketBase
introduces breaking changes you may need to regenerate it via the admin
UI then export with `./pocketbase/pocketbase migrate collections`.
