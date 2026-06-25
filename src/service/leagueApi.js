import api from "./api";
import { authHeader } from "./auth.js";

export const getMatches = () => {
    return api.get("/league/matches");
};

export const getLeagueTable = () => {
    return api.get("/league/table");
};

// Open operational action: advances the league by starting the next round.
export const startNextRound = () => {
    return api.post("/league/start-next-round", null, authHeader());
};

// Open operational action: starts a new cycle of fixtures once the season is over
// (all rounds played). Rejected by the server while a round is pending or live.
export const regenerateRounds = () => {
    return api.post("/league/regenerate-rounds");
};
