import { useNavigate } from "react-router-dom";

function MainPage() {
    const navigate = useNavigate();

    return (
        <div>
            <nav>
                <h2>Sharat</h2>

                <button onClick={() => navigate("/register")}>
                    הרשמה
                </button>

                <button onClick={() => navigate("/login")}>
                    התחברות
                </button>
            </nav>

            <main>
                <h1>ברוך הבא לאתר</h1>
                <p>בחר הרשמה או התחברות כדי להמשיך</p>
            </main>
        </div>
    );
}

export default MainPage;