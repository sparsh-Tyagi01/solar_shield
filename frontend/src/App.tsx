import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StormPrediction from './pages/StormPrediction';
import ImpactAnalysis from './pages/ImpactAnalysis';
import HistoricalData from './pages/HistoricalData';
import SolarSystem3DView from './pages/SolarSystem3DView';
import TimeMachine from './pages/TimeMachine';
import Navigation from './components/Navigation';
import { WebSocketProvider } from './context/WebSocketContext';
import './App.css';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/*" element={
              <>
                <Navigation />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/3d-view" element={<SolarSystem3DView />} />
                  <Route path="/time-machine" element={<TimeMachine />} />
                  <Route path="/prediction" element={<StormPrediction />} />
                  <Route path="/impact" element={<ImpactAnalysis />} />
                  <Route path="/history" element={<HistoricalData />} />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
