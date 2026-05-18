import PocketBase from 'pocketbase';

const url = import.meta.env?.VITE_PB_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(url);

// pb.authStore is the default LocalAuthStore, which persists the session
// to localStorage automatically across page reloads.

// Disable the SDK's auto-cancellation of duplicate requests. It's intended
// for rapid-fire scenarios like search-as-you-type, but here it bites
// React 18 StrictMode's double-effect: the second useEffect call cancels
// the first, and the first's promise rejects with "request was aborted".
// Nothing in this app benefits from per-call autocancel.
pb.autoCancellation(false);

export default pb;
