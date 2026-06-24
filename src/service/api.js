import axios from "axios";
import { getToken } from "./auth.js";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Attach the JWT (if present) to every request as `Authorization: Bearer <token>`.
// Additive and non-breaking: when no token exists the request is left unchanged,
// and existing per-request headers are preserved. This pre-positions all calls to
// carry the token before the backend starts enforcing auth on user-owned endpoints.
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// The backend grants the once-per-day bonus on login / profile validation and
// flags it with `dailyBonusGranted` on exactly the response that granted it.
// Broadcast a single app-wide event so a toast can notify the user, regardless
// of which call (login, dashboard, profile, bet page) happened to trigger it.
api.interceptors.response.use((response) => {
    if (response?.data?.dailyBonusGranted) {
        window.dispatchEvent(new CustomEvent("dailyBonusGranted", { detail: { amount: 1000 } }));
    }
    return response;
});

export default api;
