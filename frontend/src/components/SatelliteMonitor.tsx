import React from 'react';
import { motion } from 'framer-motion';
import { 
  SignalIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/solid';

interface SatelliteData {
  id: string;
  name: string;
  health: number;
  altitude: number;
  type: string;
  degradation: number;
}

interface SatelliteMonitorProps {
  satellites: SatelliteData[];
  radiationLevel: number;
}

const SatelliteMonitor: React.FC<SatelliteMonitorProps> = ({ satellites, radiationLevel }) => {
  const getStatusIcon = (health: number) => {
    if (health > 80) return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    if (health > 50) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
    return <XCircleIcon className="w-5 h-5 text-red-400" />;
  };

  const getStatusColor = (health: number) => {
    if (health > 80) return 'border-green-500/50 bg-green-500/10';
    if (health > 50) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-red-500/50 bg-red-500/10';
  };

  const radiationStatus = radiationLevel > 15 ? 'Extreme' :
                          radiationLevel > 10 ? 'High' :
                          radiationLevel > 5 ? 'Moderate' : 'Low';
  
  const radiationColor = radiationLevel > 15 ? 'text-red-400' :
                         radiationLevel > 10 ? 'text-orange-400' :
                         radiationLevel > 5 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4">
      {/* Radiation Level Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Solar Radiation Level</h3>
          <SignalIcon className={`w-6 h-6 ${radiationColor}`} />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  radiationLevel > 15 ? 'bg-red-500' :
                  radiationLevel > 10 ? 'bg-orange-500' :
                  radiationLevel > 5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (radiationLevel / 20) * 100)}%` }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold ${radiationColor}`}>
            {radiationStatus}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Level: {radiationLevel.toFixed(2)} units • Affecting {satellites.filter(s => s.health < 90).length} satellites
        </p>
      </motion.div>

      {/* Satellite Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {satellites.map((satellite, index) => (
          <motion.div
            key={satellite.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg p-3 border ${getStatusColor(satellite.health)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(satellite.health)}
                <div>
                  <h4 className="text-sm font-semibold text-white">{satellite.name}</h4>
                  <p className="text-xs text-gray-400">{satellite.type}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{satellite.altitude} km</span>
            </div>

            {/* Health Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Health</span>
                <span>{satellite.health.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    satellite.health > 80 ? 'bg-green-500' :
                    satellite.health > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${satellite.health}%` }}
                />
              </div>
            </div>

            {/* Degradation Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Radiation Damage</span>
                <span>{satellite.degradation.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${satellite.degradation}%` }}
                />
              </div>
            </div>

            {/* Status Message */}
            {satellite.health < 50 && (
              <p className="text-xs text-red-400 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                Critical: Immediate attention required
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Fleet Status Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {satellites.filter(s => s.health > 80).length}
            </p>
            <p className="text-xs text-gray-400">Healthy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {satellites.filter(s => s.health > 50 && s.health <= 80).length}
            </p>
            <p className="text-xs text-gray-400">Degraded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {satellites.filter(s => s.health <= 50).length}
            </p>
            <p className="text-xs text-gray-400">Critical</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SatelliteMonitor;