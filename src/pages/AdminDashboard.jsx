import { useEffect, useState } from "react";
import { getAllUsers, updateUserBalance } from "../service/adminApi.js";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [balanceInputs, setBalanceInputs] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUsers = () => {
        setLoading(true);
        getAllUsers()
            .then((response) => {
                setUsers(response.data);
                setBalanceInputs(
                    response.data.reduce((acc, user) => {
                        acc[user.id] = String(user.balance ?? "");
                        return acc;
                    }, {})
                );
            })
            .catch((error) => {
                setIsError(true);
                setMessage(getErrorMessage(error, "לא ניתן לטעון את רשימת המשתמשים."));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSave = (userId) => {
        const rawValue = balanceInputs[userId];
        const newBalance = Number(rawValue);

        if (rawValue === "" || Number.isNaN(newBalance)) {
            setIsError(true);
            setMessage("יש להזין יתרה תקינה (מספר).");
            return;
        }
        if (newBalance < 0) {
            setIsError(true);
            setMessage("היתרה לא יכולה להיות שלילית.");
            return;
        }

        setSavingId(userId);
        setMessage("");
        setIsError(false);

        updateUserBalance(userId, newBalance)
            .then((response) => {
                const updated = response.data;
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
                setBalanceInputs((prev) => ({ ...prev, [updated.id]: String(updated.balance) }));
                setIsError(false);
                setMessage(`היתרה של ${updated.username} עודכנה בהצלחה ל-${Number(updated.balance).toFixed(2)} ש"ח.`);
            })
            .catch((error) => {
                setIsError(true);
                setMessage(getErrorMessage(error, "עדכון היתרה נכשל."));
            })
            .finally(() => setSavingId(null));
    };

    return (
        <div className="admin-page" dir="rtl">
            <div className="admin-container">
                <div className="admin-header">
                    <h1>🛡️ ניהול משתמשים</h1>
                    <p>צפייה במשתמשים ועדכון יתרות. פעולה זו זמינה למנהלים בלבד.</p>
                </div>

                {message && (
                    <p className={`admin-status ${isError ? "admin-status-error" : "admin-status-success"}`}>
                        {message}
                    </p>
                )}

                {loading ? (
                    <p className="admin-empty">טוען נתונים...</p>
                ) : users.length === 0 ? (
                    <p className="admin-empty">אין משתמשים להצגה.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>מזהה</th>
                                    <th>שם משתמש</th>
                                    <th>אימייל</th>
                                    <th>תפקיד</th>
                                    <th>יתרה נוכחית</th>
                                    <th>יתרה חדשה</th>
                                    <th>פעולה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td className="admin-email">{user.email}</td>
                                        <td>
                                            <span className={`admin-role ${user.role === "ADMIN" ? "admin-role-admin" : ""}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="admin-balance">{Number(user.balance ?? 0).toFixed(2)}</td>
                                        <td>
                                            <input
                                                className="admin-balance-input"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={balanceInputs[user.id] ?? ""}
                                                onChange={(e) =>
                                                    setBalanceInputs((prev) => ({ ...prev, [user.id]: e.target.value }))
                                                }
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="admin-save-btn"
                                                onClick={() => handleSave(user.id)}
                                                disabled={savingId === user.id}
                                            >
                                                {savingId === user.id ? "שומר..." : "שמור"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function getErrorMessage(error, fallback) {
    const data = error.response?.data;
    if (typeof data === "string") {
        return data;
    }
    return data?.message || data?.error || fallback;
}

export default AdminDashboard;
