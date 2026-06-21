import api from "./api";

export const placeBet = (data) => {
    return api.post("/bets/place", data);
};

export const getUserBets = (userId) => {
    return api.get(`/bets/user/${userId}`);
};

export const getUserPendingBets = (userId) => {
    return api.get(`/bets/user/${userId}/pending`);
};
