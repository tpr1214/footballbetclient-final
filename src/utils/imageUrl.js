import { API_BASE_URL } from "../service/api.js";

// The backend serves uploaded files (e.g. profile images) from its own origin
// under /uploads/**, but stores them as host-relative paths. Derive the backend
// origin from the API base by stripping the trailing "/api".
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// Resolves a stored image reference to a loadable URL:
// - absolute http(s) URLs and in-browser blob:/data: URLs are returned as-is;
// - host-relative paths (e.g. "/uploads/...") are prefixed with the backend origin.
export function resolveImageUrl(url) {
    if (!url) return "";
    if (/^(https?:|blob:|data:)/i.test(url)) {
        return url;
    }
    return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}
