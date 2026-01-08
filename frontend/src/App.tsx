import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StormPrediction from './pages/StormPrediction';
import ImpactAnalysis from './pages/ImpactAnalysis';
import HistoricalData from './pages/HistoricalData';
import Navigation from './components/Navigation';
import { WebSocketProvider } from './context/WebSocketContext';
import './App.css';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prediction" element={<StormPrediction />} />
            <Route path="/impact" element={<ImpactAnalysis />} />
            <Route path="/history" element={<HistoricalData />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
