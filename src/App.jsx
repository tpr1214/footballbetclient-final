import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import MainPage from "./components/MainPage.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import BetPage from "./components/BetPage.jsx";
import MyGames from "./components/MyGames.jsx";
import LiveMatchDashboard from "./pages/LiveMatchDashboard.jsx";
import PersonalBetsDashboard from "./pages/PersonalBetsDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BackButton from "./components/BackButton.jsx";
import Navbar from "./components/Navbar.jsx";
import DailyBonusToast from "./components/DailyBonusToast.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { RequireAuth, RequireAdmin, RedirectIfAuth } from "./auth/guards.jsx";



function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar/>
                <BackButton/>
                <DailyBonusToast/>
                <Routes>
                    <Route path="/" element={<RedirectIfAuth><MainPage/></RedirectIfAuth>}/>
                    <Route path="/register" element={<RedirectIfAuth><RegisterForm/></RedirectIfAuth>}/>
                    <Route path="/login" element={<RedirectIfAuth><Login/></RedirectIfAuth>}/>
                    <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>
                    <Route path="/bet" element={<RequireAuth><BetPage/></RequireAuth>}/>
                    <Route path="/my-games" element={<RequireAuth><MyGames/></RequireAuth>}/>
                    <Route path="/live" element={<RequireAuth><LiveMatchDashboard/></RequireAuth>}/>
                    <Route path="/my-bets" element={<RequireAuth><PersonalBetsDashboard/></RequireAuth>}/>
                    <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>}/>
                    <Route path="/admin" element={<RequireAdmin><AdminDashboard/></RequireAdmin>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;
