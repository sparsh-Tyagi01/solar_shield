import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const ImpactAnalysis: React.FC = () => {
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactData();
    const interval = setInterval(fetchImpactData, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchImpactData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/predict/impact');
      setImpactData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching impact data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading impact analysis...</div>
      </div>
    );
  }

  const radarData = [
    { category: 'Satellites', risk: (impactData?.satellites || 0) * 100 },
    { category: 'GPS', risk: (impactData?.gps || 0) * 100 },
    { category: 'Communication', risk: (impactData?.communication || 0) * 100 },
    { category: 'Power Grid', risk: (impactData?.power_grid || 0) * 100 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Infrastructure Impact Analysis
        </h1>
        <p className="text-gray-300">
          Risk assessment for critical systems
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="category" stroke="#999" />
              <PolarRadiusAxis stroke="#999" />
              <Radar name="Risk Level" dataKey="risk" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Impact Details
          </h2>
          <div className="space-y-4">
            {radarData.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">{item.category}</span>
                  <span className="text-white font-semibold">{item.risk.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.risk > 70 ? 'bg-red-500' : item.risk > 40 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.risk}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
