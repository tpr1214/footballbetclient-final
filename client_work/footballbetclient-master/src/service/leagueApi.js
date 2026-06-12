import api from "./api";

export const getMatches = () => {
    return api.get("/league/matches");
};

export const getLeagueTable = () => {
    return api.get("/league/table");
};

export const startNextRound = () => {
    return api.post("/league/start-next-round");
};
