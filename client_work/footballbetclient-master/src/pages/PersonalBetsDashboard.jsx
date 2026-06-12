// דף הימורים אישי

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserBets} from "../service/betApi.js";

function PersonalBetsDashboard (){
const [myBets, setMyBets] = useState([]); //רשימת ההימורים שהמשתמש המחובר ביצע
const [totalEarnings, setTotalEarnings] = useState(0); //רווחים של המשתמש בהימורים של המשחקים שכבר הסתיימו
const [message, setMessage] = useState("");
const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (!user?.id) {
            setMessage("צריך להתחבר כדי לראות הימורים אישיים.");
            return;
        }

        getUserBets(user.id)
            .then((response) => {
                setMyBets(response.data);
                const winnings = response.data
                    .filter((bet) => bet.status === "WON")
                    .reduce((sum, bet) => sum + (Number(bet.amount) * Number(bet.odds)), 0);
                setTotalEarnings(winnings);
            })
            .catch(() => setMessage("לא ניתן לטעון את ההימורים שלך כרגע."));
    }, []);


    return(
        <div className="page-shell">
            <h1>ההימורים שלי</h1>
            {message && (
                <>
                    <p className="status-message">{message}</p>
                    <button onClick={() => navigate("/login")}>התחברות</button>
                </>
            )}

            <p>רווחים שחושבו מהימורים שזכו: {totalEarnings.toFixed(2)}</p>

            <div className="grid-list">
                {myBets.map((bet) => (
                    <article className="match-card" key={bet.id}>
                        <h3>{bet.homeTeam} נגד {bet.awayTeam}</h3>
                        <p>מחזור {bet.roundNumber}</p>
                        <p>בחירה: {translateOutcome(bet.predictedOutcome)}</p>
                        <p>תוצאה חזויה: {bet.predictedHomeScore} - {bet.predictedAwayScore}</p>
                        <p>סכום: {bet.amount}</p>
                        <p>יחס: {bet.odds}</p>
                        <p>סטטוס: {bet.status}</p>
                    </article>
                ))}
            </div>
        </div>
    )
}

function translateOutcome(outcome) {
    if (outcome === "HOME_WIN") return "ניצחון בית";
    if (outcome === "AWAY_WIN") return "ניצחון חוץ";
    if (outcome === "DRAW") return "תיקו";
    return outcome;
}

export default  PersonalBetsDashboard;
