import api from "./api";
import { getStoredUser } from "./auth.js";

// The backend identifies the requester via the X-User-Id header and verifies the
// ADMIN role server-side before allowing any admin action.
const adminHeaders = () => {
    const user = getStoredUser();
    return { headers: { "X-User-Id": user?.id } };
};

export const getAllUsers = () => {
    return api.get("/admin/users", adminHeaders());
};

export const updateUserBalance = (userId, balance) => {
    return api.put(`/admin/users/${userId}/balance`, { balance }, adminHeaders());
};
