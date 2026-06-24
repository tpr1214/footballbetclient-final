import api from "./api";
import { authHeader } from "./auth.js";

// Admin endpoints now require a JWT with role ADMIN. The token is sent as
// `Authorization: Bearer <token>`; the backend authorizes by role (no longer by
// the spoofable X-User-Id header).
export const getAllUsers = () => {
    return api.get("/admin/users", authHeader());
};

export const updateUserBalance = (userId, balance) => {
    return api.put(`/admin/users/${userId}/balance`, { balance }, authHeader());
};
