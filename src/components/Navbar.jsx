import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);


    const hiddenRoutes = ["/", "/login", "/register"];
    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    const user = JSON.parse(localStorage.getItem("currentUser") || "null");

    const getLinkClass = (path) => {
        return `nav-link-btn ${location.pathname === path ? "active" : ""}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

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
            </div>

            <div className="nav-actions">
                {user?.username ? (
                    <div className="nav-profile-container" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <div className="nav-profile-icon">
                            {user.profileImageUrl ? (
                                <>
                                    <img 
                                        src={user.profileImageUrl} 
                                        alt="Profile" 
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    <span className="profile-initial" style={{display: 'none'}}>{user.username.charAt(0).toUpperCase()}</span>
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

export default Navbar;
