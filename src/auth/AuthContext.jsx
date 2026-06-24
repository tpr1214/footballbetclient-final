import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getProfile } from "../service/authApi.js";
import { getStoredUser, persistUser, isAdminUser } from "../service/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    // "checking" while we validate the stored user against the backend, then "ready".
    const [status, setStatus] = useState("checking");
    // Tracks whether the user was updated after mount (e.g. a profile save) so a
    // slow initial validation request can't overwrite newer data.
    const userTouchedRef = useRef(false);

    const setCurrentUser = useCallback((nextUser) => {
        userTouchedRef.current = true;
        persistUser(nextUser);
        setUser(nextUser || null);
    }, []);

    // Validate the stored user on app load / refresh / reopen. If the backend no
    // longer recognizes the user (invalid/expired "token"), clear it so the user
    // is sent to login. Network errors keep the optimistic stored user.
    useEffect(() => {
        let isMounted = true;
        const stored = getStoredUser();

        if (!stored?.id) {
            setStatus("ready");
            return;
        }

        getProfile(stored.id)
            .then((response) => {
                if (!isMounted) return;
                // Don't clobber a newer update (e.g. a profile image just saved).
                if (!userTouchedRef.current) {
                    setCurrentUser(response.data);
                }
                setStatus("ready");
            })
            .catch((error) => {
                if (!isMounted) return;
                // A real HTTP response (e.g. 404 user not found) means the stored
                // identity is invalid → clear it. A missing response means the
                // server is unreachable → keep the stored user optimistically.
                if (error.response && !userTouchedRef.current) {
                    setCurrentUser(null);
                }
                setStatus("ready");
            });

        return () => {
            isMounted = false;
        };
    }, [setCurrentUser]);

    // Keep context in sync when other components update the user
    // (Login, Profile save, Navbar logout) via the shared custom event.
    useEffect(() => {
        const handleUpdate = (event) => {
            userTouchedRef.current = true;
            setUser(event.detail ?? getStoredUser());
        };
        window.addEventListener("currentUserUpdated", handleUpdate);
        return () => window.removeEventListener("currentUserUpdated", handleUpdate);
    }, []);

    const value = {
        user,
        status,
        isAuthenticated: !!user,
        isAdmin: isAdminUser(user),
        login: setCurrentUser,
        logout: () => setCurrentUser(null),
        setUser: setCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
