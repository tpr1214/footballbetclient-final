import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import "./MainPage.css";

function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="main-clean-page">

            <nav className="main-nav-bar">
                <div className="main-nav-right">
                    <span className="main-nav-icon">⚽</span>
                    <span className="main-nav-logo-text">FootballBet</span>
                </div>
                <ThemeToggle />
            </nav>

            <main className="main-content-area">
                <div className="main-hero-card">
                    <div className="main-hero-badge">🏆</div>
                    <h1> Football Bet
                    </h1>
                    <p>
                        ברוכים הבאים לפלטפורמת ניהול הליגה וההימורים הדינמית.
                        עקבו אחר משחקים בזמן אמת, נהלו את היתרה שלכם ובצעו הימורים אסטרטגיים.
                    </p>

                    <div className="main-action-group">
                        <button className="main-big-btn main-big-btn-primary" onClick={() => navigate("/login")}>
                            התחבר לחשבון
                        </button>
                        <button className="main-big-btn main-big-btn-accent" onClick={() => navigate("/register")}>
                            צור חשבון חדש
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MainPage;