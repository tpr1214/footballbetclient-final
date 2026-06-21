
import {useEffect, useState} from "react";
import {API_BASE_URL} from "../service/api.js";
import {getLeagueTable, getMatches, startNextRound} from "../service/leagueApi.js";

function LiveMatchDashboard (){
const [matches, setMatches] = useState([]);
const [leagueTable, setLeagueTable] = useState([]);
const [roundNumber,setRoundNumber] = useState(0);
const [isLive, setIsLive] = useState(false);
const [statusMessage, setStatusMessage] = useState("מחובר לדשבורד הלייב");
const activeMatches = matches.filter((match) => match.status === "LIVE" || match.status === "PENDING");
const completedMatches = matches.filter((match) => match.status === "COMPLETED");

    const loadData = () => {
        getMatches().then((response) => {
            setMatches(response.data);
            const liveMatch = response.data.find((match) => match.status === "LIVE");
            setIsLive(Boolean(liveMatch));
            setRoundNumber(liveMatch?.roundNumber || response.data.find((match) => match.status === "PENDING")?.roundNumber || 0);
        });
        getLeagueTable().then((response) => setLeagueTable(response.data));
    };

    useEffect(() => {
        loadData();
        const source = new EventSource(`${API_BASE_URL}/live/stream`);

        source.addEventListener("match-update", (event) => {
            const data = JSON.parse(event.data);
            setStatusMessage(`מחזור ${data.roundNumber} התחיל`);
            setIsLive(true);
            setRoundNumber(data.roundNumber);
            setMatches((prev) => mergeMatches(prev, data.matches || []));
        });

        source.addEventListener("goal", (event) => {
            const data = JSON.parse(event.data);
            setStatusMessage(`גול! ${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam}`);
            setMatches((prev) => updateMatchScore(prev, data));
        });

        source.addEventListener("round-complete", (event) => {
            const data = JSON.parse(event.data);
            setStatusMessage(`מחזור ${data.roundNumber} הסתיים`);
            setIsLive(false);
            setMatches((prev) => mergeMatches(prev, data.matches || []));
            getLeagueTable().then((response) => setLeagueTable(response.data));
        });

        source.onerror = () => {
            setStatusMessage("חיבור הלייב נותק או שהשרת לא פעיל כרגע.");
        };

        return () => source.close();
    }, []);

    const handleStartRound = () => {
        setStatusMessage("מתחיל מחזור...");
        startNextRound()
            .then((response) => {
                setMatches((prev) => mergeMatches(prev, response.data));
                setRoundNumber(response.data[0]?.roundNumber || 0);
                setIsLive(true);
            })
            .catch((error) => {
                setStatusMessage(error.response?.data?.message || error.response?.data || "לא ניתן להתחיל מחזור כרגע.");
            });
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h1>דשבורד משחקים חיים</h1>
                    {roundNumber > 0 && <p className="header-subtitle">מחזור {roundNumber}</p>}
                </div>
                <button disabled={isLive} onClick={handleStartRound}>
                    התחל מחזור הבא
                </button>
            </div>

            <p className="status-message">{statusMessage}</p>

            <div className="dashboard-layout">
                <section>
                    <div className="live-columns">
                        <div>
                            <h2>משחקים חיים וממתינים</h2>
                            <div className="match-window-grid">
                                {activeMatches.map((match) => (
                                    <MatchWindow key={match.id} match={match}/>
                                ))}
                                {activeMatches.length === 0 && <p className="empty-state">אין כרגע משחקים חיים או ממתינים.</p>}
                            </div>
                        </div>

                        <div>
                            <h2>משחקים שהסתיימו</h2>
                            <div className="match-window-grid">
                                {completedMatches.map((match) => (
                                    <MatchWindow key={match.id} match={match}/>
                                ))}
                                {completedMatches.length === 0 && <p className="empty-state">עוד לא הסתיימו משחקים.</p>}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>טבלת ליגה</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>קבוצה</th>
                            <th>נק'</th>
                            <th>זכות</th>
                            <th>חובה</th>
                            <th>הפרש</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leagueTable.map((team) => (
                            <tr key={team.id}>
                                <td>{team.name}</td>
                                <td>{team.points}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td>{team.goalsFor - team.goalsAgainst}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </div>

        </div>
    )
}

function MatchWindow({match}) {
    return (
        <article className={`match-window match-window-${match.status.toLowerCase()}`}>
            <div className="match-window-top">
                <span>מחזור {match.roundNumber}</span>
                <span className="status-chip">{translateStatus(match.status)}</span>
            </div>

            <div className="scoreboard">
                <div className="team-side">
                    <span className="team-name">{match.homeTeam.name}</span>
                    <span className="team-score">{match.homeScore}</span>
                </div>

                <span className="score-divider">:</span>

                <div className="team-side">
                    <span className="team-name">{match.awayTeam.name}</span>
                    <span className="team-score">{match.awayScore}</span>
                </div>
            </div>
        </article>
    );
}

function translateStatus(status) {
    if (status === "LIVE") return "חי";
    if (status === "PENDING") return "ממתין";
    if (status === "COMPLETED") return "הסתיים";
    return status;
}

function updateMatchScore(matches, event) {
    return matches.map((match) => {
        if (match.id !== event.matchId) {
            return match;
        }
        return {
            ...match,
            homeScore: event.homeScore,
            awayScore: event.awayScore,
            status: event.status
        };
    });
}

function mergeMatches(currentMatches, updatedMatches) {
    const byId = new Map(currentMatches.map((match) => [match.id, match]));
    updatedMatches.forEach((match) => byId.set(match.id, match));
    return Array.from(byId.values()).sort((a, b) => a.roundNumber - b.roundNumber || a.id - b.id);
}

export default LiveMatchDashboard ;
