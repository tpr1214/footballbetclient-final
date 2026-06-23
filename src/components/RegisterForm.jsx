import { useState } from "react";
import { register } from "../service/authApi.js";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import "./RegisterForm.css";

function RegisterForm() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const usernameRegex = (value) => {
        const checkUserName = /^[A-Za-z0-9]+$/;
        return checkUserName.test(value.trim());
    };

    const passwordRegex = (value) => {
        const checkPassword =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/;

        return checkPassword.test(value.trim());
    };

    const emailRegex = (value) => {
        const checkEmail =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
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

        if (!passwordRegex(password)) {
            setIsSuccess(false);
            setMessage(
                "הסיסמה חלשה מדי. יש להזין לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד."
            );
            return;
        }

        const data = {
            username: username,
            passwordHash: password,
            email: email
        };

        register(data)
            .then((response) => {
                setIsSuccess(true);
                setMessage(response.data || "המשתמש נרשם בהצלחה!");

                setUsername("");
                setPassword("");
                setEmail("");

                setTimeout(() => navigate("/login"), 1200);
            })
            .catch((error) => {
                console.log(error);

                setIsSuccess(false);

                const serverErrorMessage =
                    error.response?.data ||
                    "הרשמה נכשלה, אנא נסה שוב.";

                setMessage(serverErrorMessage);
            });
    };

    return (
        <div className="login-clean-page">

            <nav className="login-nav-bar">
                <div className="login-nav-right">
                    <span className="login-nav-icon">⚽</span>
                    <span
                        className="login-nav-logo-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        FootballBet
                    </span>
                </div>

                <div className="login-nav-actions">
                    <div className="login-nav-user">שלום, אורח</div>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="login-content-container">

                <div className="login-welcome-badge">
                    ברוכים הבאים למערכת
                </div>

                <div className="login-main-card">
                    <div className="login-card-content">

                        <h2 className="login-card-headline">
                            יצירת חשבון חדש
                        </h2>

                        <form
                            onSubmit={handleRegister}
                            className="login-form-element"
                        >

                            <div className="login-field-group">
                                <label>שם משתמש</label>

                                <input
                                    type="text"
                                    value={username}
                                    placeholder="הזן שם משתמש"
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>

                            <div className="login-field-group">
                                <label>סיסמה</label>

                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        placeholder="לפחות 8 תווים"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            paddingLeft: "40px"
                                        }}
                                    />

                                    <span
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            cursor: "pointer",
                                            fontSize: "1.2rem",
                                            userSelect: "none"
                                        }}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </span>
                                </div>

                                {password &&
                                    !passwordRegex(password) && (
                                        <small
                                            style={{
                                                color: "#dc2626",
                                                display: "block",
                                                marginTop: "6px",
                                                textAlign: "right"
                                            }}
                                        >
                                            הסיסמה חייבת להכיל:
                                            <br />
                                            • לפחות 8 תווים
                                            <br />
                                            • אות גדולה באנגלית
                                            <br />
                                            • אות קטנה באנגלית
                                            <br />
                                            • מספר
                                            <br />
                                            • תו מיוחד (!@#$ וכו')
                                        </small>
                                    )}
                            </div>

                            <div className="login-field-group">
                                <label>דואר אלקטרוני</label>

                                <input
                                    type="email"
                                    value={email}
                                    placeholder="example@email.com"
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
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

                        {message && (
                            <div
                                className={`login-status ${
                                    isSuccess
                                        ? "login-success"
                                        : "login-error"
                                }`}
                            >
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