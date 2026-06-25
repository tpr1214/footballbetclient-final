import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [failedProfileImageUrl, setFailedProfileImageUrl] = useState("");


    const hiddenRoutes = ["/", "/login", "/register"];

    useEffect(() => {
        setFailedProfileImageUrl("");
    }, [user]);

    const getLinkClass = (path) => {
        return `nav-link-btn ${location.pathname === path ? "active" : ""}`;
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const profileImageUrl = getProfileImageUrl(user);
    const shouldShowProfileImage = profileImageUrl && failedProfileImageUrl !== profileImageUrl;

    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    return (
        <header className="global-nav-bar" dir="rtl">
            <div className="nav-right">
                <span className="nav-icon">⚽</span>
                <span className="nav-logo-text" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>FootballBet</span>
                <span className="nav-divider">|</span>
                <button className={getLinkClass("/dashboard")} onClick={() => navigate("/dashboard")}>דף ראשי</button>
                <button className={getLinkClass("/bet")} onClick={() => navigate("/bet")}>זירת הימורים</button>
                <button className={getLinkClass("/live")} onClick={() => navigate("/live")}>משחקים בזמן אמת </button>
                <button className={getLinkClass("/my-games")} onClick={() => navigate("/my-games")}>משחקים עתידיים</button>
                <button className={getLinkClass("/my-bets")} onClick={() => navigate("/my-bets")}>ההימורים שלי</button>
                {isAdmin && (
                    <button className={getLinkClass("/admin")} onClick={() => navigate("/admin")}>🛡️ ניהול משתמשים</button>
                )}
            </div>

            <div className="nav-actions">
                {user?.username ? (
                    <div className="nav-profile-container" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <div className="nav-profile-icon">
                            {shouldShowProfileImage ? (
                                <>
                                    <img
                                        src={resolveImageUrl(profileImageUrl)}
                                        alt="Profile"
                                        onError={() => setFailedProfileImageUrl(profileImageUrl)}
                                    />
                                </>
                            ) : (
                                <span className="profile-initial">{user.username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        {dropdownOpen && (
                            <div className="nav-profile-dropdown">
                                <div className="dropdown-header">שלום, <strong>{user.username}</strong></div>
                                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>פרופיל אישי</button>
                                <button className="dropdown-item logout-item" onClick={() => { setDropdownOpen(false); handleLogout(); }}>התנתק</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="nav-user">שלום, אורח 👤</div>
                )}
                <ThemeToggle />
            </div>
        </header>
    );
}

function getProfileImageUrl(user) {
    return user?.profileImageUrl || user?.profileImageLink || "";
}

export default Navbar;
