import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API } from '../config/api';
import SolarSystemVisualization from '../components/SolarSystemVisualization';
import LiveDataTicker from '../components/LiveDataTicker';
import ThreatLevelBanner from '../components/ThreatLevelBanner';
import SatelliteFleetGrid from '../components/SatelliteFleetGrid';
import ScientificGraphs from '../components/ScientificGraphs';
import AlertSystem from '../components/AlertSystem';
import SolarHeatmap from '../components/SolarHeatmap';
import AffectedRegionsMap from '../components/AffectedRegionsMap';
import SolarGPTChatbot from '../components/SolarGPTChatbot';
import VoiceAlertSystem from '../components/VoiceAlertSystem';
import EmergencyProtocols from '../components/EmergencyProtocols';
import ConfidenceMeter from '../components/ConfidenceMeter';
import LaunchWindowAdvisor from '../components/LaunchWindowAdvisor';
import { useWebSocket } from '../context/WebSocketContext';
import axios from 'axios';

interface SatelliteData {
  id: string;
  name: string;
  health: number;
  altitude: number;
  type: string;
  degradation: number;
}

const Dashboard: React.FC = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [radiationLevel, setRadiationLevel] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(1.0);
  const [backendConnected, setBackendConnected] = useState(false);
  const { messages } = useWebSocket();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const latest = messages[messages.length - 1];
      console.log('Dashboard: WebSocket message received', latest);
      setCurrentData(latest);
      
      // Update predictions from WebSocket
      if (latest.predictions) {
        console.log('Dashboard: Predictions received', latest.predictions);
        setPredictions(latest.predictions.storm_occurrence);
      }
      
      // Update satellites from WebSocket if provided
      if (latest.satellites && latest.satellites.length > 0) {
        console.log('Dashboard: Updating satellites from WebSocket, count:', latest.satellites.length);
        const formattedSatellites = latest.satellites.map((sat: any) => ({
          id: sat.id,
          name: sat.name,
          health: sat.health,
          altitude: sat.altitude,
          type: sat.type,
          degradation: sat.degradation
        }));
        setSatellites(formattedSatellites);
      }
    }
  }, [messages]);

  useEffect(() => {
    // Calculate radiation level and magnetic field based on space weather conditions
    if (currentData) {
      const bz = currentData.bz || 0;
      const speed = currentData.speed || 400;
      const density = currentData.density || 5;
      const radiation = Math.abs(bz) + (speed - 400) / 50 + density;
      setRadiationLevel(radiation);

      // Magnetic field strength affected by Bz (negative Bz weakens field)
      const fieldStrength = bz < 0 ? Math.max(0.3, 1.0 + (bz / 20)) : 1.0 + (bz / 100);
      setMagneticFieldStrength(fieldStrength);
    }
  }, [currentData]);

  const fetchCurrentData = async () => {
    try {
      const [dataRes, predRes] = await Promise.all([
        axios.get(API.currentConditions),
        axios.get(API.predictStorm)
      ]);
      
      setCurrentData(dataRes.data);
      setPredictions(predRes.data);
      setBackendConnected(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBackendConnected(false);
    }
  };

  // Helper function to calculate ISS risk level
  const getISSRiskLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    const iss = satellites.find(sat => sat.name === 'ISS' || sat.id === 'ISS');
    if (!iss) return 'low';
    
    const health = iss.health;
    const kp = currentData?.kp_index || 0;
    
    // Risk based on health and Kp index
    if (health < 60 || kp >= 7) return 'critical';
    if (health < 75 || kp >= 5) return 'high';
    if (health < 85 || kp >= 4) return 'medium';
    return 'low';
  };

  // Helper function to calculate average satellite health
  const getAverageSatelliteHealth = (): number => {
    if (satellites.length === 0) return 100;
    const totalHealth = satellites.reduce((sum, sat) => sum + sat.health, 0);
    return totalHealth / satellites.length;
  };

  const handleSatelliteUpdate = (updatedSatellites: any[]) => {
    console.log('📡 Dashboard: Received satellite update');
    console.log('📡 Count received:', updatedSatellites.length);
    console.log('📡 Satellite names received:', updatedSatellites.map((s: any) => s.name));
    setSatellites(updatedSatellites);
    console.log('📡 Dashboard state updated with', updatedSatellites.length, 'satellites');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Live Data Ticker - Always at Top */}
      <LiveDataTicker data={currentData} />

      {/* Alert System - Right Side Panel */}
      <AlertSystem predictions={predictions} currentData={currentData} />

      {/* Main Mission Control Container */}
      <div className="container mx-auto px-6 py-6">
        {/* Mission Control Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-cyan-300 font-mono uppercase tracking-wider">Live Monitoring</span>
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-2">
                <span className="text-gradient">SOLARSHIELD</span> Mission Control
              </h1>
              <p className="text-sm text-slate-400 font-mono uppercase tracking-widest">
                Real-Time Space Weather Intelligence • Satellite Protection System
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {backendConnected ? (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-3 glass-effect rounded-lg px-4 py-3 border-l-2 border-l-cyber-green"
                >
                  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-cyber-green font-mono uppercase tracking-wider">
                    System Operational
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-3 glass-effect rounded-lg px-4 py-3 border-l-2 border-l-cyber-red"
                >
                  <div className="w-2 h-2 bg-cyber-red rounded-full animate-blink"></div>
                  <span className="text-sm text-cyber-red font-mono uppercase tracking-wider">
                    Connection Lost
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Threat Level Banner */}
        {backendConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <ThreatLevelBanner 
              predictions={predictions}
              severity={predictions?.severity || currentData?.kp_index || 0}
              nextUpdateIn={300}
            />
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Panel - 3D Earth & Controls - Wider */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-1">
                    Real-Time 3D Solar System
                  </h2>
                  <p className="text-sm text-slate-400">Interactive orbit visualization and radiation mapping</p>
                </div>
                <motion.div 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30"
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-xs text-cyan-300 font-mono">LIVE</span>
                </motion.div>
              </div>
              
              {!backendConnected ? (
                <div className="w-full h-[500px] flex items-center justify-center bg-slate-900/50 rounded-xl radar-grid">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛰️</div>
                    <div className="text-xl font-display text-white mb-2">Awaiting Backend Connection</div>
                    <div className="text-sm text-slate-400 font-mono mb-6">Initializing satellite tracking systems...</div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchCurrentData}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-display font-bold uppercase tracking-wide text-sm"
                    >
                      Establish Connection
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[500px] radar-grid rounded-xl overflow-hidden border border-cyan-400/10">
                  <SolarSystemVisualization
                    radiationLevel={radiationLevel}
                    bzValue={currentData?.bz || 0}
                    solarWindSpeed={currentData?.speed || 400}
                    protonFlux={currentData?.proton_flux || 1.0}
                    xrayFlux={currentData?.xray_flux || 1e-6}
                    magneticFieldStrength={magneticFieldStrength}
                    onSatelliteUpdate={handleSatelliteUpdate}
                  />
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-cyan-400/10">
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider text-center">
                  {backendConnected 
                    ? `✓ Interactive Orbit View • ${satellites.length} Assets Tracked • Real-Time Solar Wind Simulation`
                    : '○ System Standby • Awaiting Real-Time Data Stream'}
                </p>
              </div>
            </motion.div>

            {/* Scientific Graphs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ScientificGraphs currentData={currentData} />
            </motion.div>
          </div>

          {/* Right Panel - Data & Metrics - Narrower */}
          <div className="lg:col-span-4 space-y-6">
            {/* Solar Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SolarHeatmap 
                title="Solar Activity Matrix"
                colorScheme="solar"
                showLegend={true}
              />
            </motion.div>
          </div>
        </div>

        {/* Satellite Fleet Status Grid */}
        {satellites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <SatelliteFleetGrid 
              satellites={satellites} 
              radiationLevel={radiationLevel}
            />
          </motion.div>
        )}

        {/* Affected Regions Map */}
        {satellites.length > 0 && backendConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="glass-effect rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  Global Impact Zones
                </h2>
                <p className="text-sm text-slate-400">
                  Real-time satellite coverage • Aurora zones • Affected geographic regions
                </p>
              </div>
              <AffectedRegionsMap 
                satellites={satellites}
                kpIndex={currentData?.kp_index || 3}
                stormSeverity={predictions?.severity || 0}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Confidence Meter */}
      {predictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <ConfidenceMeter
            confidence={predictions.confidence || 87}
            currentData={currentData}
            predictions={predictions}
          />
        </motion.div>
      )}

      {/* Launch Window Advisor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <LaunchWindowAdvisor
          currentData={currentData}
          predictions={predictions}
        />
      </motion.div>

      {/* AI Chatbot - SOLAR-GPT */}
      <SolarGPTChatbot />

      {/* Voice Alert System - Always visible */}
      <VoiceAlertSystem
        kpIndex={currentData?.kp_index || 0}
        imfBz={currentData?.bz || 0}
        stormProbability={predictions?.probability || 0}
        issRiskLevel={getISSRiskLevel()}
      />

      {/* Emergency Protocols - Always visible */}
      <EmergencyProtocols
        kpIndex={currentData?.kp_index || 0}
        stormProbability={predictions?.probability || 0}
        imfBz={currentData?.bz || 0}
        satelliteHealth={getAverageSatelliteHealth()}
      />
    </div>
  );
};

export default Dashboard;
