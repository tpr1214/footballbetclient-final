import api from "./api";
import { authHeader } from "./auth.js";

export const getMatches = () => {
    return api.get("/league/matches");
};

export const getLeagueTable = () => {
    return api.get("/league/table");
};

// Operational action: now requires a JWT with role ADMIN.
export const startNextRound = () => {
    return api.post("/league/start-next-round", null, authHeader());
};
