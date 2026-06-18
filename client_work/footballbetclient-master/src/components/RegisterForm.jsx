import { useState } from "react";
import { register } from "../service/authApi.js";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import "./RegisterForm.css"; // ייבוא קובץ ה-CSS החדש והמתוקן

function RegisterForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const usernameRegex = (value) => {
        const checkUserName = /^[A-Za-z0-9]+$/;
        return checkUserName.test(value.trim());
    };

    const passwordRegex = (value) => {
        const checkPassword = /^[A-Za-z!@#*0-9]{2,10}$/;
        return checkPassword.test(value.trim());
    };

    const emailRegex = (value) => {
        const checkEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return checkEmail.test(value.trim());
    };

    const validation = () => {
        let isValid = false;
        if (!usernameRegex(username)) isValid = true;
        if (!passwordRegex(password)) isValid = true;
        if (!emailRegex(email)) isValid = true;
        return isValid;
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage("");

        const data = {
            username: username,
            passwordHash: password,
            email: email
        };

        register(data).then(response => {
            setIsSuccess(true);
            setMessage(response.data || "המשתמש נרשם בהצלחה!");
            setUsername("");
            setPassword("");
            setEmail("");
            setTimeout(() => navigate("/login"), 1200);
        })
            .catch(error => {
                console.log(error);
                setIsSuccess(false);
                const serverErrorMessage = error.response?.data || "הרשמה נכשלה, אנא נסה שוב.";
                setMessage(serverErrorMessage);
            });
    };

    return (
        <div className="login-clean-page">
            {/* סרגל ניווט עליון עקבי ואחיד לחלוטין (תואם לדף הבית) */}
            <nav className="login-nav-bar">
                <div className="login-nav-right">
                    <span className="login-nav-icon">⚽</span>
                    <span className="login-nav-logo-text">פוטבול-בט</span>
                </div>
                <div className="login-nav-actions">
                    <div className="login-nav-user">שלום, אורח</div>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="login-content-container">
                {/* תגית ברוכים הבאים עליונה */}
                <div className="login-welcome-badge">ברוכים הבאים למערכת</div>

                {/* הכרטיס המרכזי */}
                <div className="login-main-card">
                    <div className="login-card-content">
                        <h2 className="login-card-headline">יצירת חשבון חדש</h2>

                        <form onSubmit={handleRegister} className="login-form-element">
                            <div className="login-field-group">
                                <label>שם משתמש</label>
                                <input
                                    type="text"
                                    value={username}
                                    placeholder="הזן שם משתמש"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="login-field-group">
                                <label>סיסמה</label>
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="הזן סיסמה (2-10 תווים)"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="login-field-group">
                                <label>דואר אלקטרוני</label>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="example@email.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={validation()}
                                type="submit"
                                className="login-action-btn"
                            >
                                הרשמה וסיום
                            </button>
                        </form>

                        {/* הצגת הודעות השגיאה/הצלחה בעיצוב החדש */}
                        {message && (
                            <div className={`login-status ${isSuccess ? 'login-success' : 'login-error'}`}>
                                {message}
                            </div>
                        )}

                        <div className="login-footer-area">
                            <hr className="login-footer-divider" />
                            <button
                                type="button"
                                className="login-center-back-btn"
                                onClick={() => navigate("/login")}
                            >
                                כבר יש לך חשבון? להתחברות
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;