import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EarthVisualization from '../components/EarthVisualization';
import RealTimeMetrics from '../components/RealTimeMetrics';
import StormAlert from '../components/StormAlert';
import SolarWindChart from '../components/SolarWindChart';
import { useWebSocket } from '../context/WebSocketContext';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
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
          Space Weather Intelligence & Geomagnetic Storm Prediction
        </p>
      </motion.div>

      {predictions?.alert_level && (
        <StormAlert
          level={predictions.alert_level}
          probability={predictions.storm_probability}
          severity={predictions.severity}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Earth Magnetosphere
          </h2>
          <EarthVisualization data={currentData} />
        </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
