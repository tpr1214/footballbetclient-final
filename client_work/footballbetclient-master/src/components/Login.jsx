import { useState } from "react";
import { login } from "../service/authApi.js";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage("");

        const data = {
            email: email,
            passwordHash: password
        };

        login(data)
            .then(response => {
                setIsSuccess(true);
                setErrorMessage("התחברת בהצלחה למערכת!");
                console.log("Logged in user:", response.data);
                localStorage.setItem("currentUser", JSON.stringify(response.data));
                setEmail("");
                setPassword("");
                navigate("/dashboard");
            })
            .catch(err => {
                console.log(err);
                setIsSuccess(false);
                const serverErrorMessage = err.response?.data || "ההתחברות נכשלה, אנא נסה שוב.";
                setErrorMessage(serverErrorMessage);
            });
    };

    return (
        <div className="login-clean-page" dir="rtl">
            {/* בר עליון מקצועי ונקי – ללא כפתור החזרה הישן */}
            <header className="login-nav-bar">
                <div className="login-nav-right">
                    <span className="login-nav-icon">⚽</span>
                    <span className="login-nav-logo-text">פוטבול-בט</span>
                    <span className="login-nav-divider">|</span>
                    <span className="login-nav-subtext">אפליקציית הימורי כדורגל</span>
                </div>

                <div className="login-nav-user">שלום, אורח 👤</div>
            </header>

            {/* אזור התוכן המרכזי של המסך */}
            <div className="login-content-container">
                {/* תגית ברכה מעודכנת */}
                <div className="login-welcome-badge">ברוכים הבאים! 👋</div>

                <div className="login-main-card">
                    <div className="login-card-content">
                        <h2 className="login-card-headline">כניסה למערכת הימורי כדורגל</h2>

                        <form onSubmit={handleLogin} className="login-form-element">
                            <div className="login-field-group">
                                <label>דואר אלקטרוני</label>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="shira33@edu.aac.ac.il"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="login-field-group">
                                <label>סיסמה</label>
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-action-btn">
                                כניסה
                            </button>
                        </form>

                        {errorMessage && (
                            <p className={`login-status ${isSuccess ? "login-success" : "login-error"}`}>
                                {errorMessage}
                            </p>
                        )}

                        {/* תחתית הכרטיס: הרשמה וכפתור חזרה ממורכזים פה */}
                        <div className="login-footer-area">
                            <button className="login-link-register-btn" onClick={() => navigate("/register")}>
                                הרשמה למשתמש חדש ✨
                            </button>

                            <hr className="login-footer-divider" />

                            <button className="login-center-back-btn" onClick={() => navigate(-1)}>
                                ⬅️ חזרה אחורה
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;