import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeBet } from "../service/betApi.js";
import { getMatches } from "../service/leagueApi.js";
import { getProfile } from "../service/authApi.js";
import TeamName from "./TeamName.jsx";
import {getTeamLabel} from "../utils/teamIcons.js";
import "./BetPage.css";

const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (typeof data === "string") {
        return data;
    }
    return data?.message || data?.error || fallback;
};

function BetPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    const [matches, setMatches] = useState([]);
    const [amountByMatch, setAmountByMatch] = useState({});
    const [homeScoreByMatch, setHomeScoreByMatch] = useState({});
    const [awayScoreByMatch, setAwayScoreByMatch] = useState({});
    const [balance, setBalance] = useState(Number(user?.balance || 0));
    const [message, setMessage] = useState("");

    const loadMatches = () => {
        getMatches()
            .then((response) => setMatches(response.data.filter((match) => match.status === "PENDING")))
            .catch(() => setMessage("לא ניתן לטעון משחקים להימור כרגע."));
    };

    useEffect(() => {
        loadMatches();
        if (user?.id) {
            getProfile(user.id)
                .then((response) => {
                    setBalance(Number(response.data.balance || 0));
                    localStorage.setItem("currentUser", JSON.stringify(response.data));
                })
                .catch(() => setMessage("לא ניתן לטעון יתרה עדכנית כרגע."));
        }
    }, [user?.id]);


    const handleSetMaxAmount = (matchId) => {
        setAmountByMatch((prev) => ({ ...prev, [matchId]: Math.floor(balance) }));
    };

    const handlePlaceBet = (matchId) => {
        if (!user?.id) {
            setMessage("צריך להתחבר לפני ביצוע הימור.");
            navigate("/login");
            return;
        }

        const amount = Number(amountByMatch[matchId]);
        const homeScoreValue = homeScoreByMatch[matchId];
        const awayScoreValue = awayScoreByMatch[matchId];
        const predictedHomeScore = Number(homeScoreValue);
        const predictedAwayScore = Number(awayScoreValue);
        const predictedOutcome = getOutcomeFromScore(predictedHomeScore, predictedAwayScore);

        if (!amount || amount <= 0) {
            setMessage("הזן סכום חיובי.");
            return;
        }

        if (amount > balance) {
            setMessage(`אין מספיק יתרה. היתרה שלך היא ${balance.toFixed(2)} בלבד.`);
            return;
        }

        if (homeScoreValue === undefined || homeScoreValue === "" || awayScoreValue === undefined || awayScoreValue === ""
            || !Number.isInteger(predictedHomeScore) || !Number.isInteger(predictedAwayScore)
            || predictedHomeScore < 0 || predictedHomeScore > 3 || predictedAwayScore < 0 || predictedAwayScore > 3) {
            setMessage("בחר תוצאה מדויקת עד 3 שערים לכל קבוצה (לפי דרישות הליגה).");
            return;
        }

        if (!predictedOutcome) {
            setMessage("בחר תוצאה מדויקת.");
            return;
        }

        placeBet({
            userId: user.id,
            matchId,
            predictedOutcome,
            predictedHomeScore,
            predictedAwayScore,
            amount
        })
            .then(() => {
                const updatedUser = { ...user, balance: balance - amount };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                setBalance((prev) => prev - amount);
                setMessage("ההימור נשמר בהצלחה במערכת!");
                setAmountByMatch((prev) => ({ ...prev, [matchId]: "" }));
                setHomeScoreByMatch((prev) => ({ ...prev, [matchId]: "" }));
                setAwayScoreByMatch((prev) => ({ ...prev, [matchId]: "" }));
            })
            .catch((error) => {
                setMessage(getErrorMessage(error, "שמירת ההימור נכשלה."));
            });
    };

    const statusClass = message.includes("בהצלחה") ? "bet-status-message bet-status-success" : "bet-status-message";

    return (
        <div className="bet-clean-page">
            <div className="bet-content-container">
                <div className="bet-header-section">
                    <h1>חלון הימורים פעיל</h1>
                    <p>ההימורים פתוחים כעת! ברגע שיוזנק המחזור, חלון ההימורים יינעל אוטומטית.</p>
                    <div className="bet-balance-pill">היתרה שלך: {balance.toFixed(2)} ש"ח</div>
                </div>

                {message && <p className={statusClass}>{message}</p>}

                <div className="bet-grid-list">
                    {matches.length === 0 ? (
                        <p className="no-data-text" style={{gridColumn: '1/-1', fontSize: '1.1rem'}}>אין כרגע משחקים זמינים להימור. המחזור החל או שהעונה הסתיימה.</p>
                    ) : (
                        matches.map((match) => (
                            <section className="bet-match-card" key={match.id}>
                                <h3 className="bet-match-title-row">
                                    <TeamName team={match.homeTeam} />
                                    <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>VS</span>
                                    <TeamName team={match.awayTeam} />
                                </h3>
                                <p className="bet-match-info">
                                    ⏱️ מחזור {match.roundNumber} • <span style={{color: '#16a34a', fontWeight: 'bold'}}>🔓 חלון פתוח</span>
                                </p>

                                <OddsPanel match={match} />

                                <p className="bet-field-label">סכום הימור בש"ח</p>
                                <div className="bet-amount-row">
                                    <input
                                        className="bet-amount-input"
                                        type="number"
                                        min="1"
                                        max={balance}
                                        value={amountByMatch[match.id] || ""}
                                        placeholder="0.00"
                                        onChange={(e) => setAmountByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        className="bet-max-btn"
                                        onClick={() => handleSetMaxAmount(match.id)}
                                    >
                                        MAX
                                    </button>
                                </div>

                                <p className="bet-field-label">ניבוי תוצאה מדויקת (מקסימום 3 שערים)</p>
                                <div className="bet-score-prediction">
                                    <select
                                        value={homeScoreByMatch[match.id] || ""}
                                        onChange={(e) => setHomeScoreByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                    >
                                        <option value="">{getTeamLabel(match.homeTeam)}</option>
                                        {SCORE_OPTIONS.map((score) => <option key={score} value={score}>{score}</option>)}
                                    </select>
                                    <span>:</span>
                                    <select
                                        value={awayScoreByMatch[match.id] || ""}
                                        onChange={(e) => setAwayScoreByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                    >
                                        <option value="">{getTeamLabel(match.awayTeam)}</option>
                                        {SCORE_OPTIONS.map((score) => <option key={score} value={score}>{score}</option>)}
                                    </select>
                                </div>

                                <p className="bet-exact-odds">
                                    💰 מכפיל רווח משוער: {getSelectedExactOdds(match, homeScoreByMatch[match.id], awayScoreByMatch[match.id])}
                                </p>

                                <button className="bet-action-btn" onClick={() => handlePlaceBet(match.id)}>
                                    אישור ושליחת טופס
                                </button>
                            </section>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const SCORE_OPTIONS = [0, 1, 2, 3];

function OddsPanel({ match }) {
    const odds = calculateOutcomeOdds(match);

    return (
        <div className="bet-odds-panel">
            <span><TeamName team={match.homeTeam} /> <strong>{odds.home}</strong></span>
            <span>🤝 תיקו: <strong>{odds.draw}</strong></span>
            <span><TeamName team={match.awayTeam} /> <strong>{odds.away}</strong></span>
        </div>
    );
}

function getSelectedExactOdds(match, homeScoreValue, awayScoreValue) {
    if (homeScoreValue === undefined || homeScoreValue === "" || awayScoreValue === undefined || awayScoreValue === "") {
        return "-";
    }

    const homeScore = Number(homeScoreValue);
    const awayScore = Number(awayScoreValue);
    const outcome = getOutcomeFromScore(homeScore, awayScore);

    if (!outcome) {
        return "-";
    }

    return calculateExactScoreOdds(match, outcome, homeScore, awayScore);
}


function calculateOutcomeOdds(match) {
    const homeSkill = Number(match.homeTeam.skillLevel || 1);
    const awaySkill = Number(match.awayTeam.skillLevel || 1);
    const totalSkill = homeSkill + awaySkill;

    const homeProbability = homeSkill / totalSkill;
    const awayProbability = awaySkill / totalSkill;


    const skillDifference = Math.abs(homeProbability - awayProbability);
    const drawProbability = 0.33 - (skillDifference * 0.25);

    const remainingProbability = 1 - drawProbability;
    const finalHomeProb = homeProbability * remainingProbability;
    const finalAwayProb = awayProbability * remainingProbability;

    return {
        home: roundOdds(1 / finalHomeProb),
        draw: roundOdds(1 / drawProbability),
        away: roundOdds(1 / finalAwayProb)
    };
}


function calculateExactScoreOdds(match, outcome, homeScore, awayScore) {
    const outcomeOdds = calculateOutcomeOdds(match);
    const baseOdds = outcome === "HOME_WIN" ? Number(outcomeOdds.home) : outcome === "AWAY_WIN" ? Number(outcomeOdds.away) : Number(outcomeOdds.draw);

    let scoreMultiplier = 2.0;

    if (outcome === "DRAW") {
        if (homeScore === 0) scoreMultiplier *= 1.2;
        if (homeScore === 1) scoreMultiplier *= 0.9;
        if (homeScore === 2) scoreMultiplier *= 2.5;
        if (homeScore === 3) scoreMultiplier *= 6.0;
    } else {
        const homeSkill = Number(match.homeTeam.skillLevel || 1);
        const awaySkill = Number(match.awayTeam.skillLevel || 1);
        const isHomeFavorite = homeSkill >= awaySkill;
        const goalDifference = Math.abs(homeScore - awayScore);
        const totalGoals = homeScore + awayScore;


        if ((outcome === "HOME_WIN" && isHomeFavorite) || (outcome === "AWAY_WIN" && !isHomeFavorite)) {
            if (goalDifference === 1) scoreMultiplier *= 1.1;
            if (goalDifference === 2) scoreMultiplier *= 1.6;
            if (goalDifference === 3) scoreMultiplier *= 3.5;
        } else {

            scoreMultiplier *= (1.8 + goalDifference);
        }
        

        if (totalGoals >= 4) {
             scoreMultiplier *= 1.5;
        }
    }

    return roundOdds(baseOdds * scoreMultiplier);
}

function roundOdds(value) {
    return (Math.round(value * 100) / 100).toFixed(2);
}

function getOutcomeFromScore(homeScore, awayScore) {
    if (homeScore > awayScore) return "HOME_WIN";
    if (awayScore > homeScore) return "AWAY_WIN";
    if (homeScore === awayScore) return "DRAW";
    return null;
}

export default BetPage;
