import { useEffect, useState } from "react";
import "./DailyBonusToast.css";

function DailyBonusToast() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let hideTimer;

        const handleBonus = () => {
            setVisible(true);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setVisible(false), 5000);
        };

        window.addEventListener("dailyBonusGranted", handleBonus);
        return () => {
            window.removeEventListener("dailyBonusGranted", handleBonus);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div className="daily-bonus-toast" dir="rtl" role="status">
            <span className="daily-bonus-toast-icon">🎁</span>
            <span>קיבלת בונוס יומי של 1000₪</span>
        </div>
    );
}

export default DailyBonusToast;
