// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import WellnessPage from "./pages/WellnessPage";
import FinancePage from "./pages/FinancePage";
import CampusPage from "./pages/CampusPage";
import ChatPage from "./pages/ChatPage";
import ContactPage from "./pages/ContactPage";

import YouTubeVideoList from "./components/content/YouTubeVideoList";
import VideoPlayerPage from "./pages/VideoPlayerPage";

import "./styles/WellnessPage.css";
import "./styles/ContentComponents.css"; // <-- UNCOMMENT OR ADD THIS LINE
// import "./styles/ContentPage.css"; // Only needed if you use a specific ContentPage.jsx with its own layout

import Day1Task1 from "./Wellness Checks/Day1Task1";
import Day1Task2 from "./Wellness Checks/Day1Task2";
import Day1Task3 from "./Wellness Checks/Day1Task3";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/dumzii" element={<ChatPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/play-video/:videoId" element={<VideoPlayerPage />} />

        <Route path="/wellness/day1-task1" element={<Day1Task1 />} />
        <Route path="/wellness/day1-task2" element={<Day1Task2 />} />
        <Route path="/wellness/day1-task3" element={<Day1Task3 />} />
      </Routes>
    </Router>
  );
}

export default App;