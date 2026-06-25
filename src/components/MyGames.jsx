import { useEffect, useState } from "react";
import { getMatches } from "../service/leagueApi.js";
import TeamName from "./TeamName.jsx";

function MyGames() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        getMatches()
            .then((response) => {
                const sortedMatches = [...response.data].sort((a, b) => {
                    if (a.roundNumber !== b.roundNumber) {
                        return a.roundNumber - b.roundNumber;
                    }
                    return a.id - b.id;
                });
                setMatches(sortedMatches);
            })
            .catch(() => setMatches([]));
    }, []);

    return (
        <div className="dash-clean-page" dir="rtl">
            <div className="dash-main-container">
                <h1>המשחקים שלי</h1>
                <div className="grid-list">
                    {matches.length === 0 ? (
                        <p className="no-data-text" style={{ gridColumn: "1/-1" }}>
                            אין משחקים להצגה כרגע.
                        </p>
                    ) : (
                        matches.map((match) => (
                            <section className="match-card" key={match.id}>
                                <h3 className="match-title-row">
                                    <TeamName team={match.homeTeam} />
                                    <span>נגד</span>
                                    <TeamName team={match.awayTeam} />
                                </h3>
                                <p>מחזור {match.roundNumber}</p>
                                <p>{getStatusLabel(match.status)}</p>
                            </section>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function getStatusLabel(status) {
    if (status === "PENDING") return "עתידי";
    if (status === "LIVE") return "משוחק עכשיו";
    if (status === "COMPLETED") return "הסתיים";
    return status || "לא ידוע";
}

export default MyGames;
