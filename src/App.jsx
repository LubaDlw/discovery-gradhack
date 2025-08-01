import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import WellnessPage from "./pages/WellnessPage";
import FinancePage from "./pages/FinancePage";
import CampusPage from "./pages/CampusPage";
import ChatPage from "./pages/ChatPage";
import ContactPage from "./pages/ContactPage";

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
      </Routes>
    </Router>
  );
}

export default App;
