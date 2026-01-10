import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolarSystemVisualization from '../components/SolarSystemVisualization';
import RealTimeMetrics from '../components/RealTimeMetrics';
import StormAlert from '../components/StormAlert';
import SolarWindChart from '../components/SolarWindChart';
import SatelliteMonitor from '../components/SatelliteMonitor';
import RadiationChart from '../components/RadiationChart';
import { useWebSocket } from '../context/WebSocketContext';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [satellites, setSatellites] = useState<any[]>([]);
  const [radiationLevel, setRadiationLevel] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(1.0);
  const { messages } = useWebSocket();

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const latest = messages[messages.length - 1];
      setCurrentData(latest);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSatelliteUpdate = (updatedSatellites: any[]) => {
    setSatellites(updatedSatellites);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          SolarGuard 3D - Real-Time Monitoring
        </h1>
        <p className="text-gray-300">
          Space Weather Intelligence & Satellite Health Monitoring
        </p>
      </motion.div>

      {predictions?.alert_level && (
        <StormAlert
          level={predictions.alert_level}
          probability={predictions.storm_probability}
          severity={predictions.severity}
        />
      )}

      <div className="grid grid-cols-1 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Solar System - Real-Time 3D Visualization
          </h2>
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
          <p className="text-xs text-gray-400 mt-2 text-center">
            Drag to rotate • Scroll to zoom • 6 satellites tracked • Sun radiation and Earth's magnetic field based on real ML model data
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Real-Time Metrics
          </h2>
          <RealTimeMetrics data={currentData} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">
          Solar Wind Parameters (Last 24 Hours)
        </h2>
        <SolarWindChart />
      </motion.div>
    </div>
  );
};

export default Dashboard;
