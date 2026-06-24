// Lightweight auth helpers built around the `currentUser` object stored in
// localStorage. The backend does not issue JWTs — the stored user object IS the
// "token". A user is considered authenticated while a `currentUser` exists and
// still resolves against the backend (see AuthContext validation on load).

const STORAGE_KEY = "currentUser";

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
        return null;
    }
};

export const persistUser = (user) => {
    if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent("currentUserUpdated", { detail: user || null }));
};

export const isAdminUser = (user) => (user?.role || "").toUpperCase() === "ADMIN";
