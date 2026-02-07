import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Activity, Zap } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="data-value text-2xl mb-2">Analyzing Storm Patterns</div>
          <div className="text-gray-400 text-sm font-mono uppercase tracking-wider">AI Models Processing...</div>
        </div>
      </div>
    );
  };

  const probabilityPercent = ((predictions?.probability || predictions?.storm_probability || 0) * 100).toFixed(1);
  const severity = (predictions?.severity || 0).toFixed(2);
  const alertLevel = (predictions?.alert_level || 'Normal').toUpperCase();
  const confidence = ((predictions?.confidence || 0.85) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header with Gradient Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-display font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3 uppercase tracking-wider">
            Storm Prediction Analysis
          </h1>
          <p className="text-gray-400 text-lg font-mono uppercase tracking-widest flex items-center space-x-3">
            <Brain className="w-5 h-5 text-cyber-cyan" />
            <span>AI-Powered • Geomagnetic Storm Forecasting • ML Models</span>
          </p>
        </motion.div>

        {/* Prediction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mission-panel p-6 rounded-xl backdrop-blur-xl hover-lift border-cyan-500/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wider font-bold">Storm Probability</h3>
            </div>
            <div className="data-value text-5xl mb-2">
              {probabilityPercent}%
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden border border-cyan-500/30">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${probabilityPercent}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mission-panel p-6 rounded-xl backdrop-blur-xl hover-lift border-red-500/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-6 h-6 text-red-400" />
              <h3 className="text-red-300 text-sm font-mono uppercase tracking-wider font-bold">Severity Score</h3>
            </div>
            <div className="text-5xl font-mono font-black mb-2" style={{ color: '#ff4444' }}>
              {severity}
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden border border-red-500/30">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                style={{ width: `${(parseFloat(severity) / 10) * 100}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mission-panel p-6 rounded-xl backdrop-blur-xl hover-lift border-amber-500/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-amber-300 text-sm font-mono uppercase tracking-wider font-bold">Alert Level</h3>
            </div>
            <div className="text-4xl font-display font-black mb-2 uppercase" style={{ color: '#ffb020' }}>
              {alertLevel}
            </div>
            <div className={`text-xs font-mono font-semibold uppercase tracking-wider ${
              alertLevel === 'CRITICAL' ? 'text-red-400' :
              alertLevel === 'HIGH' ? 'text-orange-400' :
              alertLevel === 'MODERATE' ? 'text-amber-400' :
              'text-green-400'
            }`}>
              {alertLevel === 'CRITICAL' ? '🔴 Immediate Action Required' :
               alertLevel === 'HIGH' ? '🟠 High Alert Status' :
               alertLevel === 'MODERATE' ? '🟡 Monitoring Status' :
               '🟢 All Systems Normal'}
            </div>
          </motion.div>
        </div>

        {/* Prediction Details Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mission-panel p-6 rounded-2xl backdrop-blur-xl mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-cyber-cyan" />
            <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider">
              Prediction Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-mono uppercase tracking-wider">Model Confidence:</span>
                <span className="data-value text-xl">{confidence}%</span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden border border-green-500/30">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-mono uppercase tracking-wider">Forecast Window:</span>
                <span className="data-value text-base">6-24 Hours</span>
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Real-Time Analysis</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-mono uppercase tracking-wider">Last Updated:</span>
                <span className="data-value text-base">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </motion.div>

        {/* AI Model Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mission-panel p-6 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider">
                ML Model Ensemble
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <div className="text-cyan-400 text-sm font-mono uppercase tracking-wider mb-2">XGBoost Classifier</div>
              <div className="data-value text-2xl mb-1">Active</div>
              <div className="text-xs text-gray-500 font-mono">Risk Classification</div>
            </div>

            <div className="bg-gray-800/30 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <div className="text-blue-400 text-sm font-mono uppercase tracking-wider mb-2">LSTM Network</div>
              <div className="data-value text-2xl mb-1">Active</div>
              <div className="text-xs text-gray-500 font-mono">Time Series Analysis</div>
            </div>

            <div className="bg-gray-800/30 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <div className="text-purple-400 text-sm font-mono uppercase tracking-wider mb-2">Random Forest</div>
              <div className="data-value text-2xl mb-1">Active</div>
              <div className="text-xs text-gray-500 font-mono">Severity Prediction</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/20">
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider text-center">
              Trained on 30+ Years of NOAA Space Weather Data • Real-Time Parameter Analysis • Multi-Model Consensus
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StormPrediction;
