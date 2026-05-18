/// <reference path="../pb_data/types.d.ts" />

// In a production single-container deploy we bake the Vite build into the
// same image as PocketBase and let PB serve it. This hook activates only
// when PB_STATIC_DIR is set (Dockerfile does that). In local dev the
// frontend is served by Vite on its own port, so we leave PB API-only.
//
// indexFallback=true makes PB return /index.html for any path that doesn't
// match a file — needed for the React Router SPA.

const buildDir = $os.getenv("PB_STATIC_DIR");
if (buildDir) {
  routerAdd("GET", "/{path...}", $apis.static(buildDir, true));
}
