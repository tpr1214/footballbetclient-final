import { useLocation, useNavigate } from "react-router-dom";
import "./BackButton.css"; // ייבוא נקי ובטוח מאותה התיקייה!

function BackButton() {
    const location = useLocation();
    const navigate = useNavigate();

    // הסתרת הכפתור בדף הבית ובדשבורד הראשי, שם אין צורך לחזור אחורה
    if (location.pathname === "/" || location.pathname === "/dashboard") {
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