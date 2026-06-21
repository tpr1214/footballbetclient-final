import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});
export default api;
