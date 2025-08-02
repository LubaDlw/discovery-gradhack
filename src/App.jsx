import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import WellnessPage from "./pages/WellnessPage";
import FinancePage from "./pages/FinancePage";
import CampusPage from "./pages/CampusPage";
import ChatPage from "./pages/ChatPage";
import ContactPage from "./pages/ContactPage";
import "./styles/WellnessPage.css";
import Day2Task1 from "./Wellness Checks/Day2Task1"; // steps counter challenge
import Day3Task1 from "./Wellness Checks/Day3Task1";  // water in take route
import Day1Streak1 from "./Financial Challenges/Day1Streak1";
import Day1Streak2 from "./Financial Challenges/Day1Streak2";
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
        <Route path="/Day2Task1" element = {<Day2Task1/>}/>
        <Route path="/Day3Task1" element = {<Day3Task1/>}/>
        <Route path="/Day1Streak1" element = {<Day1Streak1/>}/>
        <Route path="/Day1Streak2" element = {<Day1Streak2/>}/>
      </Routes>
    </Router>
  );
}

export default App;
