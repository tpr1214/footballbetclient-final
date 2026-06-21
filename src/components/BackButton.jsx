import { useLocation, useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton() {
    const location = useLocation();
    const navigate = useNavigate();


    const hiddenPaths = ["/", "/dashboard", "/login", "/register"];
    if (hiddenPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <div className="back-button-container">
            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                ← חזרה אחורה
            </button>
        </div>
    );
}

export default BackButton;