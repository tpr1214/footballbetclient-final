import { useState, useEffect } from "react";
import "./ThemeToggle.css";

function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("fb-theme");
        if (saved) return saved;
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("fb-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
        >
            <span className="theme-toggle-icon">
                {theme === "dark" ? "☀️" : "🌙"}
            </span>
        </button>
    );
}

export default ThemeToggle;
