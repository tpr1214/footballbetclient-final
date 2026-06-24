import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function AuthLoading() {
    return (
        <div
            dir="rtl"
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
            }}
        >
            טוען...
        </div>
    );
}

// Protected routes: only an authenticated user may pass, otherwise → /login.
export function RequireAuth({ children }) {
    const { status, isAuthenticated } = useAuth();
    if (status === "checking") return <AuthLoading />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin-only routes: must be authenticated AND an admin, otherwise redirect.
export function RequireAdmin({ children }) {
    const { status, isAuthenticated, isAdmin } = useAuth();
    if (status === "checking") return <AuthLoading />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

// Public-only routes (landing / login / register): an already-authenticated user
// is sent straight to the dashboard.
export function RedirectIfAuth({ children }) {
    const { status, isAuthenticated } = useAuth();
    if (status === "checking") return <AuthLoading />;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}
