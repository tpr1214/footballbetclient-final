
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

export const uploadProfileImage = (userId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    // Let the browser set the multipart/form-data Content-Type (with boundary).
    return api.post(`/auth/profile/${userId}/image`, formData);
}
