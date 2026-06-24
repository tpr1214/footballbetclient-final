import { useEffect, useRef, useState } from "react";
import { getProfile, updateProfile, uploadProfileImage } from "../service/authApi.js";
import { getUserBets } from "../service/betApi.js";
import { useAuth } from "../auth/AuthContext.jsx";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function Profile() {
    const { setUser: setAuthUser } = useAuth();
    const [storedUser] = useState(() => JSON.parse(localStorage.getItem("currentUser") || "null"));
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [balance, setBalance] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState(() => getProfileImageUrl(storedUser));
    const [failedProfileImageUrl, setFailedProfileImageUrl] = useState("");
    const [profileLink, setProfileLink] = useState("");
    const [bets, setBets] = useState([]);
    const [message, setMessage] = useState(storedUser?.id ? "" : "No logged-in user was found.");
    const [isSaving, setIsSaving] = useState(false);
    const [userId] = useState(storedUser?.id || null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!storedUser?.id) {
            return;
        }

        getProfile(storedUser.id)
            .then((response) => {
                const user = response.data;
                setUsername(user.username || "");
                setEmail(user.email || "");
                setBalance(user.balance);
                setProfileImageUrl(getProfileImageUrl(user));
                setFailedProfileImageUrl("");
                setProfileLink(user.profileLink || "");
                // Update the shared auth state so the navbar avatar stays in sync.
                setAuthUser(user);
            })
            .catch(() => setMessage("Could not load the profile right now."));

        getUserBets(storedUser.id)
            .then((response) => setBets(response.data))
            .catch(() => setMessage("Profile loaded, but betting statistics could not be loaded right now."));
    }, [storedUser, setAuthUser]);

    // Revoke the in-memory preview URL when it changes or the component unmounts.
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const stats = calculateBetStats(bets);
    // The avatar shows the locally-chosen image preview while one is pending,
    // otherwise the stored profile image.
    const displayImageUrl = previewUrl || profileImageUrl;
    const shouldShowProfileImage = previewUrl
        ? true
        : Boolean(profileImageUrl) && failedProfileImageUrl !== profileImageUrl;

    const clearSelectedImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        setMessage("");

        if (!file) {
            clearSelectedImage();
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            clearSelectedImage();
            setMessage("Unsupported file type. Please choose a JPG, JPEG, PNG, or WEBP image.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            clearSelectedImage();
            setMessage("The file is too large. The maximum allowed size is 5MB.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!userId) {
            setMessage("No logged-in user was found.");
            return;
        }

        // Preserve the current image unless a new file is being uploaded.
        let finalProfileImageUrl = profileImageUrl;
        setIsSaving(true);
        setMessage("");
        setFailedProfileImageUrl("");

        try {
            if (selectedFile) {
                // Upload the chosen file via multipart; the server stores it and
                // returns the persisted public image URL.
                const uploadResponse = await uploadProfileImage(userId, selectedFile);
                finalProfileImageUrl = getProfileImageUrl(uploadResponse.data);
            }

            const requestPayload = {
                username,
                profileImageUrl: finalProfileImageUrl,
                profileLink
            };
            const response = await updateProfile(userId, requestPayload);
            const savedProfileImageUrl = getProfileImageUrl(response.data);

            setUsername(response.data.username || "");
            setProfileImageUrl(savedProfileImageUrl);
            setProfileLink(response.data.profileLink || "");
            setFailedProfileImageUrl("");
            clearSelectedImage();
            // Propagate to the shared auth state so EVERY avatar (navbar included)
            // re-renders from the same updated user object.
            setAuthUser(response.data);
            setMessage("Profile updated successfully.");
        } catch (error) {
            const serverMessage = error.response?.data?.message || (typeof error.response?.data === "string" ? error.response.data : null);
            setMessage(serverMessage || error.message || "Saving the profile failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="profile-panel">
                <div className="profile-hero">
                    <div className="profile-avatar-block">
                        <button
                            type="button"
                            className="profile-avatar profile-avatar-button"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            title="Change image"
                            aria-label="Change profile image"
                        >
                            {shouldShowProfileImage ? (
                                <img
                                    src={displayImageUrl}
                                    alt="Profile"
                                    onError={() => {
                                        if (!previewUrl) {
                                            setFailedProfileImageUrl(profileImageUrl);
                                        }
                                    }}
                                />
                            ) : null}
                            <div style={{ display: shouldShowProfileImage ? "none" : "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                                {getInitials(username || email)}
                            </div>
                            <span className="profile-avatar-overlay">📷</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            id="profile-image-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div>
                        <h1>{username || "Profile"}</h1>
                    </div>
                </div>

                {message && <p className="status-message">{message}</p>}

                <div className="profile-stats">
                    <section>
                        <span>Available balance</span>
                        <strong>{formatBalance(balance)}</strong>
                    </section>
                    <section>
                        <span>Total bets</span>
                        <strong>{stats.totalBets}</strong>
                    </section>
                    <section>
                        <span>Win rate</span>
                        <strong>{stats.winRate}%</strong>
                    </section>
                    <section>
                        <span>Total earnings</span>
                        <strong>{stats.totalEarnings.toFixed(2)}</strong>
                    </section>
                    <section>
                        <span>Email</span>
                        <strong>{email || "-"}</strong>
                    </section>
                    <section>
                        <span>Username</span>
                        <strong>{username || "-"}</strong>
                    </section>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <h2>Edit Profile</h2>
                    <label htmlFor="profile-username">Name</label>
                    <input
                        id="profile-username"
                        value={username}
                        placeholder="Username"
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <button type="submit" className="save-btn" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function getInitials(value) {
    if (!value) return "U";
    return value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getProfileImageUrl(user) {
    return user?.profileImageUrl || user?.profileImageLink || "";
}

function formatBalance(value) {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        return "-";
    }
    return numberValue.toFixed(2);
}

function calculateBetStats(bets) {
    const completedBets = bets.filter((bet) => bet.status === "WON" || bet.status === "LOST");
    const wonBets = bets.filter((bet) => bet.status === "WON");
    const totalEarnings = wonBets.reduce((sum, bet) => sum + (Number(bet.amount) * Number(bet.odds)), 0);
    const winRate = completedBets.length === 0 ? 0 : Math.round((wonBets.length / completedBets.length) * 100);

    return {
        totalBets: bets.length,
        winRate,
        totalEarnings
    };
}

export default Profile;
