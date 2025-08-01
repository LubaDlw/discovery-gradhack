import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
// import DashboardPage from './pages/DashboardPage';
import RewardsPage from './pages/RewardsPage';
// import ProfilePage from './pages/ProfilePage';
import MentalWellnessPage from './pages/MentalWellnessPage';
import FinancialLiteracyPage from './pages/FinancialLiteracyPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="Wellness" element= {<MentalWellnessPage/>}/>
          <Route path="Finance" element = {<FinancialLiteracyPage/>}/>
          <Route path="Dumzii" element ={<ChatPage/>}/>
          <Route path="rewards" element={<RewardsPage />} />
        
        </Route>
      </Routes>
    </Router>
  );
}

export default App;