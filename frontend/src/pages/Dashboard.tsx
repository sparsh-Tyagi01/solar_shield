import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolarSystemVisualization from '../components/SolarSystemVisualization';
import RealTimeMetrics from '../components/RealTimeMetrics';
import StormAlert from '../components/StormAlert';
import SolarWindChart from '../components/SolarWindChart';
import SatelliteMonitor from '../components/SatelliteMonitor';
import RadiationChart from '../components/RadiationChart';
import AffectedRegionsMap from '../components/AffectedRegionsMap';
import ModelImprovementStatus from '../components/ModelImprovementStatus';
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
  const [impactData, setImpactData] = useState<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [radiationLevel, setRadiationLevel] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(1.0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { messages } = useWebSocket();


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
        setImpactData(latest.predictions.impacts);
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
      const [dataRes, predRes, impactRes] = await Promise.all([
        axios.get('http://localhost:8000/api/current-conditions'),
        axios.get('http://localhost:8000/api/predict/storm'),
        axios.post('http://localhost:8000/predict/impact', {
          bz: currentData?.bz || -5,
          speed: currentData?.speed || 450,
          density: currentData?.density || 8,
          pressure: currentData?.pressure || 2.5,
          xray_flux: currentData?.xray_flux || 1e-5,
          proton_flux: currentData?.proton_flux || 10
        }).catch(() => null)
      ]);
      
      setCurrentData(dataRes.data);
      setPredictions(predRes.data);
      if (impactRes) setImpactData(impactRes.data);
      setBackendConnected(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBackendConnected(false);
      setConnectionError('Backend server not responding. Please start the server.');
    }
  };

  const handleSatelliteUpdate = (updatedSatellites: any[]) => {
    console.log('📡 Dashboard: Received satellite update');
    console.log('📡 Count received:', updatedSatellites.length);
    console.log('📡 Satellite names received:', updatedSatellites.map((s: any) => s.name));
    setSatellites(updatedSatellites);
    console.log('📡 Dashboard state updated with', updatedSatellites.length, 'satellites');
  };

  // Fleet status calculations
  const fleetStats = {
    total: satellites.length,
    healthy: satellites.filter(s => s.health > 80).length,
    degraded: satellites.filter(s => s.health > 50 && s.health <= 80).length,
    critical: satellites.filter(s => s.health <= 50).length,
    avgHealth: satellites.length > 0 
      ? (satellites.reduce((sum, s) => sum + s.health, 0) / satellites.length).toFixed(1)
      : 100,
    avgDegradation: satellites.length > 0
      ? (satellites.reduce((sum, s) => sum + s.degradation, 0) / satellites.length).toFixed(1)
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            SolarShield - Real-Time Monitoring
          </h1>
          <p className="text-slate-600">
            Space Weather Intelligence & Satellite Health Monitoring
          </p>
        </motion.div>

        {/* Connection Status Banner */}
        {!backendConnected && connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-red-500 text-3xl">⚠️</div>
                <div>
                  <h3 className="text-red-700 font-semibold text-lg">Backend Server Not Connected</h3>
                  <p className="text-red-600 text-sm">{connectionError}</p>
                  <p className="text-red-700 text-xs mt-1">Start with: <code className="bg-red-100 px-2 py-1 rounded">uvicorn backend.main:app --reload</code></p>
                </div>
              </div>
              <button
                onClick={fetchCurrentData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {backendConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Backend Connected</span>
              </div>
              {satellites.length > 0 && (
                <div className="flex items-center space-x-2 text-blue-600 text-sm">
                  <span className="font-semibold">
                    {satellites.filter((s: any) => s.real_data).length}/{satellites.length} satellites with LIVE tracking
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-600 font-semibold">
                    REAL DATA
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {predictions && predictions.risk_level && (
          <StormAlert
            level={predictions.risk_level}
            probability={predictions.probability || predictions.storm_probability || 0}
            severity={predictions.severity || currentData?.kp_index || 3}
            confidence={predictions.confidence || 85}
          />
        )}

        {/* Model Improvement Status - NEW FEATURE */}
        <ModelImprovementStatus />

        {/* Fleet Status Summary */}
        {satellites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Fleet Status Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{fleetStats.total}</div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{fleetStats.healthy}</div>
                <div className="text-xs text-slate-600">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{fleetStats.degraded}</div>
                <div className="text-xs text-slate-600">Degraded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{fleetStats.critical}</div>
                <div className="text-xs text-slate-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{fleetStats.avgHealth}%</div>
                <div className="text-xs text-slate-600">Avg Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{fleetStats.avgDegradation}%</div>
                <div className="text-xs text-slate-600">Avg Degradation</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Impact Systems Alert - Only show when there's actual risk */}
      {impactData && 
       impactData.affected_systems && 
       Array.isArray(impactData.affected_systems) && 
       impactData.affected_systems.length > 0 && 
       (predictions?.severity > 6 || predictions?.probability > 0.6) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="text-red-600 text-3xl">⚠️</div>
            <div>
              <h3 className="text-red-700 font-bold text-lg">
                {impactData.affected_systems.length} System(s) at Risk
              </h3>
              <p className="text-red-600 text-sm">
                Affected: {impactData.affected_systems.map((s: string) => 
                  s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                ).join(', ')}
              </p>
              <p className="text-red-500 text-xs mt-1">
                Storm Severity: {predictions?.severity?.toFixed(1) || 'N/A'} • 
                Probability: {((predictions?.probability || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Solar System - Real-Time 3D Visualization
          </h2>
          {!backendConnected ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-red-300">
              <div className="text-center">
                <div className="text-6xl mb-4">🛰️</div>
                <div className="text-red-600 text-xl font-semibold mb-2">Waiting for Backend Connection</div>
                <div className="text-slate-600 text-sm">Satellites will appear once connected to the server</div>
                <button
                  onClick={fetchCurrentData}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Connect to Backend
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-[600px]">
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
          <p className="text-xs text-slate-500 mt-2 text-center">
            {backendConnected 
              ? 'Drag to rotate • Scroll to zoom • 6 satellites tracked • Sun radiation and Earth\'s magnetic field based on real ML model data'
              : 'Connect to backend to see real-time satellite data'}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Real-Time Metrics
          </h2>
          <RealTimeMetrics data={currentData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Solar Wind Parameters
          </h2>
          <SolarWindChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Satellite Fleet Monitor
          </h2>
          <SatelliteMonitor 
            satellites={satellites} 
            radiationLevel={radiationLevel}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RadiationChart currentRadiation={radiationLevel} />
        </motion.div>
      </div>

      {/* Global Coverage Map */}
      {satellites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <AffectedRegionsMap satellites={satellites} />
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
