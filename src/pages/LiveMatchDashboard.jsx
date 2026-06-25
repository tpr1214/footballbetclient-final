
import {useEffect, useState} from "react";
import {API_BASE_URL} from "../service/api.js";
import {getLeagueTable, getMatches, regenerateRounds, startNextRound} from "../service/leagueApi.js";
import {getStoredUser} from "../service/auth.js";
import TeamName from "../components/TeamName.jsx";

function LiveMatchDashboard (){
const [matches, setMatches] = useState([]);
const [leagueTable, setLeagueTable] = useState([]);
const [roundNumber,setRoundNumber] = useState(0);
const [isLive, setIsLive] = useState(false);
const [goalAlert, setGoalAlert] = useState(null);
const [statusMessage, setStatusMessage] = useState("מחובר לדשבורד הלייב");
const activeMatches = matches.filter((match) => match.status === "LIVE" || match.status === "PENDING");
const completedMatches = matches.filter((match) => match.status === "COMPLETED");
const pendingMatches = matches.filter((match) => match.status === "PENDING");
// The season is over (and a new cycle can be generated) once there are matches,
// none are still pending, and nothing is live.
const canRegenerate = matches.length > 0 && pendingMatches.length === 0 && !isLive;

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
        const user = getStoredUser();
        const userId = user?.id;
        if (!userId) {
            setStatusMessage("יש להתחבר מחדש כדי לצפות בליגה האישית.");
            return;
        }

        loadData();
        const source = new EventSource(`${API_BASE_URL}/live/stream?userId=${encodeURIComponent(userId)}`);

        source.addEventListener("match-update", (event) => {
            const data = JSON.parse(event.data);
            if (!isEventForUser(data, userId)) return;
            setStatusMessage(`מחזור ${data.roundNumber} התחיל`);
            setIsLive(true);
            setRoundNumber(data.roundNumber);
            setMatches((prev) => mergeMatches(prev, data.matches || []));
        });

        source.addEventListener("goal", (event) => {
            const data = JSON.parse(event.data);
            if (!isEventForUser(data, userId)) return;
            setStatusMessage(`גול! ${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam}`);
            setMatches((prev) => {
                const goalDetails = getGoalDetails(prev, data);
                if (goalDetails) {
                    setGoalAlert(goalDetails);
                }
                return updateMatchScore(prev, data);
            });
        });

        source.addEventListener("round-complete", (event) => {
            const data = JSON.parse(event.data);
            if (!isEventForUser(data, userId)) return;
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

    useEffect(() => {
        if (!goalAlert) return;

        const timeoutId = setTimeout(() => {
            setGoalAlert(null);
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [goalAlert]);

    const handleStartRound = () => {
        setStatusMessage("מתחיל מחזור...");
        startNextRound()
            .then((response) => {
                setMatches((prev) => mergeMatches(prev, response.data));
                setRoundNumber(response.data[0]?.roundNumber || 0);
                setIsLive(true);
            })
            .catch((error) => {
                const status = error.response?.status;
                const data = error.response?.data;
                // Spring's 401/403 bodies are objects ({timestamp,status,error,path})
                // with no `message`; never assign one to state or React crashes (#31).
                const serverMessage = typeof data === "string" ? data : data?.message;
                if (status === 403) {
                    setStatusMessage("אין לך הרשאת מנהל להתחלת מחזור.");
                } else if (status === 401) {
                    setStatusMessage("יש להתחבר מחדש כדי להתחיל מחזור.");
                } else {
                    setStatusMessage(serverMessage || "לא ניתן להתחיל מחזור כרגע.");
                }
            });
    };

    const handleRegenerate = () => {
        setStatusMessage("יוצר מחזורים חדשים...");
        regenerateRounds()
            .then((response) => {
                setMatches(response.data);
                setRoundNumber(response.data[0]?.roundNumber || 0);
                setIsLive(false);
                setStatusMessage("נוצרו מחזורים חדשים! אפשר להתחיל מחזור.");
            })
            .catch((error) => {
                const data = error.response?.data;
                const serverMessage = typeof data === "string" ? data : data?.message;
                setStatusMessage(serverMessage || "לא ניתן ליצור מחזורים חדשים כרגע.");
            });
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h1>דשבורד משחקים חיים</h1>
                    {roundNumber > 0 && <p className="header-subtitle">מחזור {roundNumber}</p>}
                </div>
                <div className="page-header-actions">
                    <button disabled={isLive} onClick={handleStartRound}>
                        התחל מחזור הבא
                    </button>
                    <button
                        disabled={!canRegenerate}
                        onClick={handleRegenerate}
                        title={canRegenerate ? "" : "אפשר ליצור מחזורים חדשים רק אחרי שכל המחזורים שוחקו"}
                    >
                        צור מחזורים חדשים
                    </button>
                </div>
            </div>

            <p className="status-message">{statusMessage}</p>

            {goalAlert && <GoalAlert alert={goalAlert} />}

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
                                <td><TeamName team={team} /></td>
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

function GoalAlert({alert}) {
    return (
        <div className="goal-alert" role="status" aria-live="polite" dir="rtl">
            <div className="goal-alert-kicker">גול!</div>
            <div className="goal-alert-team">
                {alert.scorers.map((team, index) => (
                    <TeamName key={`${index}-${getDisplayTeamName(team)}`} team={team} />
                ))}
            </div>
            <div className="goal-alert-score" dir="ltr">
                {alert.homeScore} - {alert.awayScore}
            </div>
            <div className="goal-alert-match">
                {getDisplayTeamName(alert.homeTeam)} נגד {getDisplayTeamName(alert.awayTeam)}
            </div>
        </div>
    );
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
                    <span className="team-name"><TeamName team={match.homeTeam} /></span>
                    <span className="team-score">{match.homeScore}</span>
                </div>

                <span className="score-divider">:</span>

                <div className="team-side">
                    <span className="team-name"><TeamName team={match.awayTeam} /></span>
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

function getGoalDetails(matches, event) {
    const previousMatch = matches.find((match) => match.id === event.matchId);
    if (!previousMatch) {
        return null;
    }

    const homeScored = Number(event.homeScore) > Number(previousMatch.homeScore);
    const awayScored = Number(event.awayScore) > Number(previousMatch.awayScore);
    const scorers = [];

    if (homeScored) {
        scorers.push(previousMatch.homeTeam || event.homeTeam);
    }

    if (awayScored) {
        scorers.push(previousMatch.awayTeam || event.awayTeam);
    }

    if (scorers.length === 0) {
        return null;
    }

    return {
        scorers,
        homeTeam: previousMatch.homeTeam || event.homeTeam,
        awayTeam: previousMatch.awayTeam || event.awayTeam,
        homeScore: event.homeScore,
        awayScore: event.awayScore
    };
}

function getDisplayTeamName(team) {
    if (!team) return "";
    return typeof team === "string" ? team.trim() : (team.name || "").trim();
}

function mergeMatches(currentMatches, updatedMatches) {
    const byId = new Map(currentMatches.map((match) => [match.id, match]));
    updatedMatches.forEach((match) => byId.set(match.id, match));
    return Array.from(byId.values()).sort((a, b) => a.roundNumber - b.roundNumber || a.id - b.id);
}

function isEventForUser(data, userId) {
    return data.userId == null || Number(data.userId) === Number(userId);
}

export default LiveMatchDashboard ;
