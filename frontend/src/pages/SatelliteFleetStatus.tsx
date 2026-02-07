import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../config/api';
import AffectedRegionsMap from '../components/AffectedRegionsMap';
import SatelliteMonitor from '../components/SatelliteMonitor';
import EarthVisualization from '../components/EarthVisualization';

interface SatelliteData {
  id: string;
  name: string;
  health: number;
  altitude: number;
  type: string;
  degradation: number;
}

const SatelliteFleetStatus: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);
  const [radiationLevel, setRadiationLevel] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API.currentConditions);
      setCurrentData(response.data);
      
      const bz = response.data.bz || 0;
      const speed = response.data.speed || 400;
      const density = response.data.density || 5;
      const radiation = Math.abs(bz) + (speed - 400) / 50 + density;
      setRadiationLevel(radiation);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSatelliteUpdate = (updatedSatellites: SatelliteData[]) => {
    setSatellites(updatedSatellites);
  };

  // Calculate fleet statistics
  const fleetStats = {
    total: satellites.length,
    operational: satellites.filter(s => s.health > 80).length,
    degraded: satellites.filter(s => s.health > 50 && s.health <= 80).length,
    critical: satellites.filter(s => s.health <= 50).length,
    avgHealth: satellites.length > 0 
      ? (satellites.reduce((sum, s) => sum + s.health, 0) / satellites.length)
      : 100,
    avgDegradation: satellites.length > 0
      ? (satellites.reduce((sum, s) => sum + s.degradation, 0) / satellites.length)
      : 0,
    byType: {
      GPS: satellites.filter(s => s.type === 'GPS').length,
      Communication: satellites.filter(s => s.type === 'Communication').length,
      Weather: satellites.filter(s => s.type === 'Weather').length,
      ISS: satellites.filter(s => s.type === 'ISS').length,
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
          Satellite Fleet Status & Coverage
        </h1>
        <p className="text-gray-300">
          Real-time monitoring of satellite health and affected regions
        </p>
      </motion.div>

      {/* Fleet Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 backdrop-blur-lg rounded-lg p-4 border border-blue-500/30"
        >
          <div className="text-3xl font-bold text-blue-400">{fleetStats.total}</div>
          <div className="text-sm text-gray-300">Total Satellites</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-green-900/30 to-green-700/30 backdrop-blur-lg rounded-lg p-4 border border-green-500/30"
        >
          <div className="text-3xl font-bold text-green-400">{fleetStats.operational}</div>
          <div className="text-sm text-gray-300">Operational</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/30 backdrop-blur-lg rounded-lg p-4 border border-yellow-500/30"
        >
          <div className="text-3xl font-bold text-yellow-400">{fleetStats.degraded}</div>
          <div className="text-sm text-gray-300">Degraded</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-red-900/30 to-red-700/30 backdrop-blur-lg rounded-lg p-4 border border-red-500/30"
        >
          <div className="text-3xl font-bold text-red-400">{fleetStats.critical}</div>
          <div className="text-sm text-gray-300">Critical</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 backdrop-blur-lg rounded-lg p-4 border border-purple-500/30"
        >
          <div className="text-3xl font-bold text-purple-400">{fleetStats.avgHealth.toFixed(0)}%</div>
          <div className="text-sm text-gray-300">Avg Health</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-orange-900/30 to-orange-700/30 backdrop-blur-lg rounded-lg p-4 border border-orange-500/30"
        >
          <div className="text-3xl font-bold text-orange-400">{fleetStats.avgDegradation.toFixed(0)}%</div>
          <div className="text-sm text-gray-300">Avg Degrade</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-pink-900/30 to-pink-700/30 backdrop-blur-lg rounded-lg p-4 border border-pink-500/30"
        >
          <div className="text-3xl font-bold text-pink-400">{radiationLevel.toFixed(1)}</div>
          <div className="text-sm text-gray-300">Radiation Level</div>
        </motion.div>
      </div>

      {/* Global Coverage Map - Priority Display */}
      {satellites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AffectedRegionsMap satellites={satellites} />
        </motion.div>
      )}

      {/* 3D Earth Visualization with Coverage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <EarthVisualization 
          data={currentData}
          onSatelliteUpdate={handleSatelliteUpdate}
        />
      </motion.div>

      {/* Satellite Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-blue-400">{fleetStats.byType.GPS}</div>
          <div className="text-sm text-gray-300">GPS Satellites</div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(fleetStats.byType.GPS / fleetStats.total * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400">{fleetStats.byType.Communication}</div>
          <div className="text-sm text-gray-300">Communication</div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${(fleetStats.byType.Communication / fleetStats.total * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-cyan-400">{fleetStats.byType.Weather}</div>
          <div className="text-sm text-gray-300">Weather</div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full" 
              style={{ width: `${(fleetStats.byType.Weather / fleetStats.total * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-green-400">{fleetStats.byType.ISS}</div>
          <div className="text-sm text-gray-300">ISS</div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(fleetStats.byType.ISS / fleetStats.total * 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Detailed Satellite List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-4">
          Detailed Satellite Monitor
        </h2>
        <SatelliteMonitor 
          satellites={satellites}
          radiationLevel={radiationLevel}
        />
      </motion.div>
    </div>
  );
};

export default SatelliteFleetStatus;
