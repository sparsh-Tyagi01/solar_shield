import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StormPrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/predict/storm');
      setPredictions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Storm Prediction Analysis
        </h1>
        <p className="text-gray-300">
          AI-powered geomagnetic storm forecasting
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 shadow-2xl"
        >
          <h3 className="text-white text-lg mb-2">Storm Probability</h3>
          <div className="text-4xl font-bold text-white">
            {((predictions?.storm_probability || 0) * 100).toFixed(1)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg p-6 shadow-2xl"
        >
          <h3 className="text-white text-lg mb-2">Severity Score</h3>
          <div className="text-4xl font-bold text-white">
            {(predictions?.severity || 0).toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-600 to-red-600 rounded-lg p-6 shadow-2xl"
        >
          <h3 className="text-white text-lg mb-2">Alert Level</h3>
          <div className="text-4xl font-bold text-white uppercase">
            {predictions?.alert_level || 'Normal'}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">
          Prediction Details
        </h2>
        <div className="text-gray-300 space-y-2">
          <p><span className="font-semibold">Model Confidence:</span> {((predictions?.confidence || 0.85) * 100).toFixed(1)}%</p>
          <p><span className="font-semibold">Forecast Window:</span> Next 6-24 hours</p>
          <p><span className="font-semibold">Last Updated:</span> {new Date().toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default StormPrediction;
