
import api from "./api";

export const register = (data) => {
    return api.post("/auth/register", data)

}

export const login = (data) => {
    return api.post("/auth/login", data);
}

export const getProfile = (userId) => {
    return api.get(`/auth/profile/${userId}`);
}

export const updateProfile = (userId, data) => {
    return api.put(`/auth/profile/${userId}`, data);
}
