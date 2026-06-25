import api from "./api";
import { authHeader } from "./auth.js";

export const getMatches = () => {
    return api.get("/league/matches");
};

export const getLeagueTable = () => {
    return api.get("/league/table");
};

export const startNextRound = () => {
    return api.post("/league/start-next-round", null, authHeader());
};

export const regenerateRounds = () => {
    return api.post("/league/regenerate-rounds", null, authHeader());
};
