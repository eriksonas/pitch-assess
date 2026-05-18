/// <reference path="../pb_data/types.d.ts" />

// PitchAssess upstream API proxy.
//
// Both routes require an authenticated PocketBase user (via $apis.requireAuth)
// so the proxy can't be hammered by anonymous callers. Server-side API keys
// are read from process env at request time; they are never returned to the
// client and never shipped in the frontend bundle.
//
// Required env vars:
//   OPENROUTER_API_KEY   — for /api/proxy/openrouter
//   OPENAI_API_KEY       — for /api/proxy/whisper

// TODO: per-user rate limiting. PocketBase's JS hook engine (goja) creates
// a fresh runtime per request, so in-memory closures/maps don't persist.
// Implement via a small `rate_limits` collection (incrementing daily counters)
// or a reverse-proxy layer when scale demands it.

// -------------------- OpenRouter chat completions --------------------
routerAdd(
  "POST",
  "/api/proxy/openrouter",
  (e) => {
    const apiKey = $os.getenv("OPENROUTER_API_KEY");
    if (!apiKey) {
      return e.json(503, {
        error: "OPENROUTER_API_KEY is not configured on the server.",
      });
    }

    const info = e.requestInfo();
    const body = info ? info.body : null;
    const model = body ? body.model : null;
    const messages = body ? body.messages : null;
    if (!model || !messages) {
      return e.json(400, {
        error: "Request must include 'model' and 'messages'.",
      });
    }

    let res;
    try {
      res = $http.send({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
          "HTTP-Referer": "pitchassess",
          "X-Title": "PitchAssess AI",
        },
        body: JSON.stringify(body),
        timeout: 120,
      });
    } catch (err) {
      return e.json(502, {
        error: "Upstream OpenRouter call failed: " + String(err),
      });
    }

    // If upstream returned 401/403, that's a server config problem,
    // not a client auth problem — translate it so the client doesn't
    // mistake it for "please sign in".
    let outStatus = res.statusCode;
    if (outStatus === 401 || outStatus === 403) outStatus = 502;

    return e.blob(outStatus, "application/json", res.body);
  },
  $apis.requireAuth("users"),
);

// -------------------- Whisper transcription --------------------
routerAdd(
  "POST",
  "/api/proxy/whisper",
  (e) => {
    const apiKey = $os.getenv("OPENAI_API_KEY");
    if (!apiKey) {
      return e.json(503, {
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    const files = e.findUploadedFiles("file");
    if (!files || files.length === 0) {
      return e.json(400, { error: "Missing 'file' upload." });
    }

    // Optional language hint sent as a form field.
    const info = e.requestInfo();
    const language = info && info.body ? info.body.language : null;

    const form = new FormData();
    form.append("file", files[0]);
    form.append("model", "whisper-1");
    form.append("response_format", "text");
    if (language) form.append("language", language);

    let res;
    try {
      res = $http.send({
        url: "https://api.openai.com/v1/audio/transcriptions",
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey },
        body: form,
        timeout: 300,
      });
    } catch (err) {
      return e.json(502, {
        error: "Upstream Whisper call failed: " + String(err),
      });
    }

    let outStatus = res.statusCode;
    if (outStatus === 401 || outStatus === 403) outStatus = 502;

    return e.blob(outStatus, "text/plain", res.body);
  },
  $apis.requireAuth("users"),
);
