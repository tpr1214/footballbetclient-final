import {useEffect, useState} from "react";
import {getProfile, updateProfile} from "../service/authApi.js";
import {getUserBets} from "../service/betApi.js";

function Profile (){
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [balance, setBalance] = useState("");
const [profileImageUrl, setProfileImageUrl] = useState("");
const [bets, setBets] = useState([]);
const [message, setMessage] = useState("");
const [isSaving, setIsSaving] = useState(false);
const [userId, setUserId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (!user?.id) {
            setMessage("לא נמצא משתמש מחובר.");
            return;
        }

        setUserId(user.id);

        getProfile(user.id)
            .then((response) => {
                setUsername(response.data.username);
                setEmail(response.data.email);
                setBalance(response.data.balance);
                setProfileImageUrl(response.data.profileImageUrl || "");
                localStorage.setItem("currentUser", JSON.stringify(response.data));
            })
            .catch(() => setMessage("לא ניתן לטעון פרופיל כרגע."));

        getUserBets(user.id)
            .then((response) => setBets(response.data))
            .catch(() => setMessage("הפרופיל נטען, אבל לא ניתן לטעון סטטיסטיקות הימורים כרגע."));
    }, []);

    const stats = calculateBetStats(bets);

    const handleSave = (event) => {
        event.preventDefault();
        if (!userId) {
            setMessage("לא נמצא משתמש מחובר.");
            return;
        }

        setIsSaving(true);
        updateProfile(userId, {username, profileImageUrl})
            .then((response) => {
                setUsername(response.data.username);
                setProfileImageUrl(response.data.profileImageUrl || "");
                localStorage.setItem("currentUser", JSON.stringify(response.data));
                setMessage("הפרופיל עודכן בהצלחה.");
            })
            .catch(() => setMessage("שמירת הפרופיל נכשלה."))
            .finally(() => setIsSaving(false));
    };

    return(
        <div className="page-shell">
            <div className="profile-panel">
                <div className="profile-hero">
                    <div className="profile-avatar">
                        {profileImageUrl ? <img src={profileImageUrl} alt="Profile"/> : getInitials(username || email)}
                    </div>
                    <div>
                        <h1>הפרופיל שלי</h1>
                        <p>{username || "משתמש מחובר"}</p>
                    </div>
                </div>

                {message && <p className="status-message">{message}</p>}

                <div className="profile-stats">
                    <section>
                        <span>יתרה זמינה</span>
                        <strong>{formatBalance(balance)}</strong>
                    </section>
                    <section>
                        <span>הימורים שבוצעו</span>
                        <strong>{stats.totalBets}</strong>
                    </section>
                    <section>
                        <span>אחוז זכייה</span>
                        <strong>{stats.winRate}%</strong>
                    </section>
                    <section>
                        <span>כסף שהורווח</span>
                        <strong>{stats.totalEarnings.toFixed(2)}</strong>
                    </section>
                    <section>
                        <span>אימייל</span>
                        <strong>{email || "-"}</strong>
                    </section>
                    <section>
                        <span>שם משתמש</span>
                        <strong>{username || "-"}</strong>
                    </section>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <h2>עריכת פרופיל</h2>
                    <input
                        value={username}
                        placeholder="שם משתמש"
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <input
                        value={profileImageUrl}
                        placeholder="קישור לתמונת פרופיל"
                        onChange={(event) => setProfileImageUrl(event.target.value)}
                    />
                    <button type="submit" disabled={isSaving}>
                        {isSaving ? "שומר..." : "שמור פרופיל"}
                    </button>
                </form>
            </div>
        </div>
    )
}

function getInitials(value) {
    if (!value) return "U";
    return value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatBalance(value) {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        return "-";
    }
    return numberValue.toFixed(2);
}

function calculateBetStats(bets) {
    const completedBets = bets.filter((bet) => bet.status === "WON" || bet.status === "LOST");
    const wonBets = bets.filter((bet) => bet.status === "WON");
    const totalEarnings = wonBets.reduce((sum, bet) => sum + (Number(bet.amount) * Number(bet.odds)), 0);
    const winRate = completedBets.length === 0 ? 0 : Math.round((wonBets.length / completedBets.length) * 100);

    return {
        totalBets: bets.length,
        winRate,
        totalEarnings
    };
}

export default  Profile;
