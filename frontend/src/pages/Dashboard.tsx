import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        axios.get('http://localhost:8000/api/current-conditions'),
        axios.get('http://localhost:8000/api/predict/storm')
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
    <div className="min-h-screen">
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
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-black text-cyber-cyan uppercase tracking-wider mb-1">
                SOLARSHIELD
              </h1>
              <p className="text-sm text-space-50 font-mono uppercase tracking-widest">
                Mission Control • Real-Time Monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {backendConnected ? (
                <div className="flex items-center space-x-2 mission-panel px-4 py-2">
                  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                  <span className="text-xs text-cyber-green font-mono uppercase tracking-wider">
                    System Operational
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mission-panel px-4 py-2 border-cyber-red">
                  <div className="w-2 h-2 bg-cyber-red rounded-full animate-blink"></div>
                  <span className="text-xs text-cyber-red font-mono uppercase tracking-wider">
                    Connection Lost
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Threat Level Banner */}
        {backendConnected && (
          <ThreatLevelBanner 
            predictions={predictions}
            severity={predictions?.severity || currentData?.kp_index || 0}
            nextUpdateIn={300}
          />
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Panel - 3D Earth & Controls - Wider */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mission-panel p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-cyber-cyan uppercase tracking-wider">
                  Real-Time 3D Solar System
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                  <span className="text-xs text-space-50 font-mono">LIVE</span>
                </div>
              </div>
              
              {!backendConnected ? (
                <div className="w-full h-[500px] flex items-center justify-center bg-space-300/30 rounded-lg radar-grid">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛰️</div>
                    <div className="data-value text-xl mb-2">Awaiting Backend Connection</div>
                    <div className="text-sm text-space-50 font-mono mb-4">Initializing satellite tracking systems...</div>
                    <button
                      onClick={fetchCurrentData}
                      className="px-6 py-3 bg-cyber-cyan text-space-400 rounded-lg hover:bg-cyber-cyan-bright transition-colors font-display font-bold uppercase tracking-wide text-sm"
                    >
                      Establish Connection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[500px] radar-grid rounded-lg overflow-hidden">
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
              
              <div className="mt-3 pt-3 border-t border-cyber-cyan/20">
                <p className="text-[10px] text-space-50 font-mono uppercase tracking-wider text-center">
                  {backendConnected 
                    ? `Interactive Orbit View • ${satellites.length} Assets Tracked • Real-Time Solar Wind Simulation`
                    : 'System Standby • Awaiting Real-Time Data Stream'}
                </p>
              </div>
            </motion.div>

            {/* Scientific Graphs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
            className="mb-6"
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
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="mission-panel p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider mb-2">
                  Global Impact Zones
                </h2>
                <p className="text-sm text-space-50 font-mono">
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
          transition={{ delay: 0.5 }}
          className="mb-6"
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
        transition={{ delay: 0.6 }}
        className="mb-6"
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
