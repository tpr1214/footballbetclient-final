import { useState } from "react";
import { login } from "../service/authApi.js";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getErrorMessage } from "../service/errorMessage.js";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: setAuthUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(() =>
        location.state?.registered ? "ההרשמה הושלמה. כעת ניתן להתחבר." : ""
    );
    const [isSuccess, setIsSuccess] = useState(() => Boolean(location.state?.registered));
    const [showPassword, setShowPassword] = useState(false);

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
                setAuthUser(response.data);
                setEmail("");
                setPassword("");
                navigate("/dashboard");
            })
            .catch(err => {
                console.log(err);
                setIsSuccess(false);
                const serverErrorMessage = getErrorMessage(err, "ההתחברות נכשלה, אנא נסה שוב.");
                setErrorMessage(serverErrorMessage);
            });
    };

    return (
        <div className="login-clean-page" dir="rtl">

            <header className="login-nav-bar">
                <div className="login-nav-right">
                    <span className="login-nav-icon">⚽</span>
                    <span className="login-nav-logo-text" style={{cursor: 'pointer'}} onClick={() => navigate("/")}>FootballBet</span>
                    <span className="login-nav-divider">|</span>
                    <span className="login-nav-subtext">   </span>
                </div>

                <div className="login-nav-actions">
                    <div className="login-nav-user">שלום, אורח 👤</div>
                    <ThemeToggle />
                </div>
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
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        placeholder="••••••••"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', paddingLeft: '40px' }}
                                    />
                                    <span 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', left: '12px', cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </span>
                                </div>
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

                        {/*  הרשמה וכפתור חזרה ממורכזים פה */}
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
