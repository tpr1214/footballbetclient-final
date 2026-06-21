// דף הימורים אישי

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserBets} from "../service/betApi.js";
import {getProfile} from "../service/authApi.js";
import TeamName from "../components/TeamName.jsx";
import "./PersonalBets.css";

function PersonalBetsDashboard (){
const [myBets, setMyBets] = useState([]);
const [totalEarnings, setTotalEarnings] = useState(0);
const [winPercentage, setWinPercentage] = useState(0);
const [balance, setBalance] = useState(0);
const [message, setMessage] = useState("");
const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (!user?.id) {
            setMessage("צריך להתחבר כדי לראות הימורים אישיים.");
            return;
        }

        getProfile(user.id).then(res => {
            setBalance(Number(res.data.balance || 0));
            localStorage.setItem("currentUser", JSON.stringify(res.data));
        }).catch(err => console.log("Failed to load profile", err));

        getUserBets(user.id)
            .then((response) => {
                setMyBets(response.data);
                
                const settledBets = response.data.filter((bet) => bet.status !== "PENDING");
                const wonBets = response.data.filter((bet) => bet.status === "WON");
                
                const winnings = wonBets.reduce((sum, bet) => sum + (Number(bet.amount) * Number(bet.odds)), 0);
                setTotalEarnings(winnings);
                
                const winPercent = settledBets.length > 0 ? ((wonBets.length / settledBets.length) * 100).toFixed(1) : 0;
                setWinPercentage(winPercent);
            })
            .catch(() => setMessage("לא ניתן לטעון את ההימורים שלך כרגע."));
    }, []);

    const getStatusText = (status) => {
        if (status === "WON") return "🎉 זכייה";
        if (status === "LOST") return "❌ הפסד";
        return "⏳ ממתין";
    };

    const getStatusClass = (status) => {
        if (status === "WON") return "status-won";
        if (status === "LOST") return "status-lost";
        return "status-pending";
    };

    return(
        <div className="dash-clean-page personal-bets-page" dir="rtl">
            <div className="personal-bets-header">
                <h1>ההימורים שלי</h1>
                <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px'}}>
                    <div className="earnings-pill">
                        סה"כ רווחים: <span className="earnings-amount">₪{totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="earnings-pill">
                        אחוזי הצלחה: <span className="earnings-amount" dir="ltr">{winPercentage}%</span>
                    </div>
                    <div className="earnings-pill" style={{borderColor: 'var(--accent-primary)', color: 'var(--text-primary)'}}>
                        יתרה נוכחית: <span className="earnings-amount" style={{color: 'var(--accent-primary)'}}>₪{balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {message && (
                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <p className="status-message">{message}</p>
                    <button className="bet-action-btn" onClick={() => navigate("/login")} style={{width: 'auto', padding: '10px 24px', margin: '0 auto'}}>התחברות</button>
                </div>
            )}

            <div className="bets-grid">
                {myBets.map((bet) => (
                    <article className="bet-card-premium" key={bet.id}>
                        <div className={`bet-status-badge ${getStatusClass(bet.status)}`}>
                            {getStatusText(bet.status)}
                        </div>
                        
                        <h3 className="bet-match-title">
                            <TeamName team={bet.homeTeam} />
                            <span>VS</span>
                            <TeamName team={bet.awayTeam} />
                        </h3>
                        <p className="bet-round-info">מחזור {bet.roundNumber}</p>

                        {bet.status !== "PENDING" && (
                            <div style={{background: 'var(--bg-input)', padding: '8px', borderRadius: '12px', margin: '12px 0'}}>
                                <p className="bet-actual-score" style={{textAlign: 'center', fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0', fontWeight: 'bold'}}>
                                    תוצאה סופית: <span dir="ltr" style={{color: 'var(--accent-secondary)'}}>{bet.actualHomeScore} - {bet.actualAwayScore}</span>
                                </p>
                            </div>
                        )}
                        
                        <div className="bet-details-grid">
                            <div className="bet-detail-box">
                                <span className="bet-detail-label">הימור (תוצאה)</span>
                                <span className="bet-detail-value">{translateOutcome(bet.predictedOutcome)}</span>
                            </div>
                            <div className="bet-detail-box">
                                <span className="bet-detail-label">ניבוי מדויק</span>
                                <span className="bet-detail-value" dir="ltr">{bet.predictedHomeScore} - {bet.predictedAwayScore}</span>
                            </div>
                        </div>

                        <div className="bet-financials">
                            <span className="bet-amount">הושקע: <strong>₪{bet.amount}</strong></span>
                            <span className="bet-potential">
                                {bet.status === "WON" ? `+₪${(bet.amount * bet.odds).toFixed(2)}` : bet.status === "LOST" ? `-₪${bet.amount}` : `₪${(bet.amount * bet.odds).toFixed(2)}`}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
            
            {myBets.length === 0 && !message && (
                <p className="no-data-text" style={{textAlign: 'center', marginTop: '48px'}}>אין לך עדיין הימורים. גש לזירת ההימורים כדי להתחיל!</p>
            )}
        </div>
    )
}

function translateOutcome(outcome) {
    if (outcome === "HOME_WIN") return "ניצחון בית";
    if (outcome === "AWAY_WIN") return "ניצחון חוץ";
    if (outcome === "DRAW") return "תיקו";
    return outcome;
}

export default PersonalBetsDashboard;
