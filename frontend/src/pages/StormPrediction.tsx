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
        <div className="text-gray-800 text-2xl">Loading predictions...</div>
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Storm Prediction Analysis
        </h1>
        <p className="text-gray-600">
          AI-powered geomagnetic storm forecasting
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 rounded-lg p-6 shadow-lg border-2 border-blue-600"
        >
          <h3 className="text-blue-700 text-lg mb-2 font-semibold">Storm Probability</h3>
          <div className="text-4xl font-bold text-blue-600">
            {((predictions?.probability || predictions?.storm_probability || 0) * 100).toFixed(1)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 rounded-lg p-6 shadow-lg border-2 border-red-600"
        >
          <h3 className="text-red-700 text-lg mb-2 font-semibold">Severity Score</h3>
          <div className="text-4xl font-bold text-red-600">
            {(predictions?.severity || 0).toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 rounded-lg p-6 shadow-lg border-2 border-orange-600"
        >
          <h3 className="text-orange-700 text-lg mb-2 font-semibold">Alert Level</h3>
          <div className="text-4xl font-bold text-orange-600 uppercase">
            {predictions?.alert_level || 'Normal'}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Prediction Details
        </h2>
        <div className="text-gray-700 space-y-2">
          <p><span className="font-semibold text-gray-800">Model Confidence:</span> {((predictions?.confidence || 0.85) * 100).toFixed(1)}%</p>
          <p><span className="font-semibold text-gray-800">Forecast Window:</span> Next 6-24 hours</p>
          <p><span className="font-semibold text-gray-800">Last Updated:</span> {new Date().toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default StormPrediction;
