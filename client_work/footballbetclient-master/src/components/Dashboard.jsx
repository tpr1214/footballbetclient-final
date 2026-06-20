import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPendingBets } from "../service/betApi.js";
import api from "../service/api.js";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem("currentUser") || "null"));


    const [matches, setMatches] = useState([
        { id: 1, homeTeam: "ברצלונה", awayTeam: "ריאל מדריד", matchTime: "LIVE", isLive: true },
        { id: 2, homeTeam: "מנצ'סטר סיטי", awayTeam: "ליברפול", matchTime: "מחר, 22:00", isLive: false },
        { id: 3, homeTeam: "מכבי תל אביב", awayTeam: "מכבי חיפה", matchTime: "15/06, 20:30", isLive: false }
    ]);
    const [openBets, setOpenBets] = useState([]);
    const [loadingBets, setLoadingBets] = useState(true);


    const fetchDashboardData = useCallback(async () => {
        if (user && user.id) {
            try {
                const response = await getUserPendingBets(user.id);
                setOpenBets(response.data);
            } catch (err) {
                console.error("שגיאה בקבלת ההימורים מהשרת:", err);
            }
        }

        try {

            const response = await api.get("/league/matches/upcoming");
            setMatches(response.data);
        } catch {
            console.warn("נתיב משחקים לא נמצא בשרת, מציג נתונים חמים דינמיים בלקוח.");
        }
    }, [user?.id]);


    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            if (user && user.id) {
                try {
                    const response = await getUserPendingBets(user.id);
                    if (isMounted) setOpenBets(response.data);
                } catch (err) {
                    console.error("שגיאה בטעינה ראשונית של הימורים:", err);
                }
            }

            try {

                const response = await api.get("/league/matches/upcoming");
                if (isMounted) setMatches(response.data);
            } catch {

            }

            if (isMounted) setLoadingBets(false);
        };


        loadInitialData();


        const interval = setInterval(() => {
            fetchDashboardData();
        }, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user?.id, fetchDashboardData]);

    const translateOutcome = (outcome) => {
        if (outcome === "HOME_WIN") return "ניצחון בית";
        if (outcome === "AWAY_WIN") return "ניצחון חוץ";
        if (outcome === "DRAW") return "תוצאת תיקו";
        return outcome;
    };

    return (
        <div className="dash-clean-page" dir="rtl">
            <div className="dash-main-container">
                {/* משחקים חמים בקרוב */}
                <aside className="dash-side-widget">
                    <div className="widget-header">
                        <span className="widget-icon">⏰</span>
                        <h3>משחקים חמים בקרוב</h3>
                    </div>
                    <div className="widget-content-list">
                        {matches.length === 0 ? (
                            <p className="no-data-text">אין משחקים קרובים כרגע</p>
                        ) : (
                            matches.map((match) => (
                                <div className="match-item-card" key={match.id}>
                                    <div className="match-teams">{match.homeTeam} - {match.awayTeam}</div>
                                    <span className={`odds-status-badge ${match.isLive || match.matchTime === 'LIVE' ? 'live' : 'date'}`}>
                                        {match.matchTime}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/*  פאנל כפתורים ופעולות */}
                <main className="dash-center-panel">
                    <div className="dash-welcome-title-box">
                        <p className="dash-user-greeting">
                            {user ? `שלום ${user.username || "משתמש"}, בחר פעולה מבוקשת:` : "שלום אורח, בחר פעולה מבוקשת:"}
                        </p>
                    </div>

                    <div className="dash-actions-grid">
                        <div className="action-grid-card" onClick={() => navigate("/bet")}>
                            <div className="action-card-icon">⚽</div>
                            <h4>להמר על משחקים</h4>
                            <span className="action-arrow">←</span>
                        </div>
                        <div className="action-grid-card" onClick={() => navigate("/live")}>
                            <div className="action-card-icon">🏟️</div>
                            <h4>משחקים בזמן אמת </h4>
                            <span className="action-arrow">←</span>
                        </div>
                        <div className="action-grid-card" onClick={() => navigate("/my-bets")}>
                            <div className="action-card-icon">🎟️</div>
                            <h4>ההימורים שלי</h4>
                            <span className="action-arrow">←</span>
                        </div>
                        <div className="action-grid-card" onClick={() => navigate("/my-games")}>
                            <div className="action-card-icon">📅</div>
                            <h4>המשחקים העתידיים</h4>
                            <span className="action-arrow">←</span>
                        </div>

                    </div>
                </main>


                <aside className="dash-side-widget">
                    <div className="widget-header">
                        <span className="widget-icon">🏆</span>
                        <h3>הימורים פתוחים שלי</h3>
                    </div>
                    <div className="widget-content-list">
                        {!user ? (
                            <p className="no-data-text">התחברי כדי לראות את ההימורים שלך</p>
                        ) : loadingBets ? (
                            <p className="no-data-text">טוען נתונים...</p>
                        ) : openBets.length === 0 ? (
                            <p className="no-data-text">אין לך הימורים פתוחים כרגע</p>
                        ) : (
                            openBets.map((bet) => (
                                <div className="bet-item-card" key={bet.id}>
                                    <div className="bet-info-wrapper">
                                        <span className="bet-title">{translateOutcome(bet.predictedOutcome)}</span>
                                        <small className="bet-teams-sub">{bet.homeTeam} - {bet.awayTeam}</small>
                                    </div>
                                    <span className="bet-odds-badge">
                                        {bet.odds ? bet.odds.toFixed(2) : "1.50"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default Dashboard;