// Lightweight auth helpers built around the `currentUser` object stored in
// localStorage. The backend now issues a JWT on login; it is stored under a
// SEPARATE key ("authToken") so that profile-revalidation responses (which carry
// no token) cannot wipe it. The token is sent as `Authorization: Bearer <token>`
// on JWT-protected requests (currently admin + start-next-round).

const STORAGE_KEY = "currentUser";
const TOKEN_KEY = "authToken";

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
        return null;
    }
};

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const persistUser = (user) => {
    if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        // Only the login response carries a token; profile revalidation responses
        // do not. Set it when present, but never clear it here for token-less
        // updates so the JWT survives a page refresh / re-validation.
        if (user.token) setToken(user.token);
    } else {
        localStorage.removeItem(STORAGE_KEY);
        clearToken();
    }
    window.dispatchEvent(new CustomEvent("currentUserUpdated", { detail: user || null }));
};

// Authorization config for JWT-protected requests. Returns an empty headers
// object when no token exists, so the backend responds 401 and callers' existing
// error handling surfaces it.
export const authHeader = () => {
    const token = getToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : { headers: {} };
};

export const isAdminUser = (user) => (user?.role || "").toUpperCase() === "ADMIN";
