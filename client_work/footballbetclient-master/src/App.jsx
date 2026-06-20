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
import BackButton from "./components/BackButton.jsx";
import Navbar from "./components/Navbar.jsx";



function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <BackButton/>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/register" element={<RegisterForm/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/bet" element={<BetPage/>}/>
                <Route path="/my-games" element={<MyGames/>}/>
                <Route path="/live" element={<LiveMatchDashboard/>}/>
                <Route path="/my-bets" element={<PersonalBetsDashboard/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;