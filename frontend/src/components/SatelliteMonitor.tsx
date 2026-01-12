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
    if (health > 80) return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    if (health > 50) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    return <XCircleIcon className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (health: number) => {
    if (health > 80) return 'border-green-600 bg-green-50';
    if (health > 50) return 'border-yellow-600 bg-yellow-50';
    return 'border-red-600 bg-red-50';
  };

  const radiationStatus = radiationLevel > 15 ? 'Extreme' :
                          radiationLevel > 10 ? 'High' :
                          radiationLevel > 5 ? 'Moderate' : 'Low';
  
  const radiationColor = radiationLevel > 15 ? 'text-red-600' :
                         radiationLevel > 10 ? 'text-orange-600' :
                         radiationLevel > 5 ? 'text-yellow-700' : 'text-green-600';

  return (
    <div className="space-y-4">
      {/* Radiation Level Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Solar Radiation Level</h3>
          <SignalIcon className={`w-6 h-6 ${radiationColor}`} />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  radiationLevel > 15 ? 'bg-red-600' :
                  radiationLevel > 10 ? 'bg-orange-600' :
                  radiationLevel > 5 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(100, (radiationLevel / 20) * 100)}%` }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold ${radiationColor}`}>
            {radiationStatus}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
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
            className={`rounded-lg p-3 border-2 ${getStatusColor(satellite.health)} shadow-md`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(satellite.health)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-gray-800">{satellite.name}</h4>
                    {(satellite as any).real_data && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-600 font-semibold">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{satellite.type}</p>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">{satellite.altitude} km</span>
            </div>

            {/* Health Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-700 mb-1">
                <span className="font-medium">Health</span>
                <span className="font-semibold">{satellite.health.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    satellite.health > 80 ? 'bg-green-600' :
                    satellite.health > 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${satellite.health}%` }}
                />
              </div>
            </div>

            {/* Degradation Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-700 mb-1">
                <span className="font-medium">Radiation Damage</span>
                <span className="font-semibold">{satellite.degradation.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-red-600 transition-all duration-300"
                  style={{ width: `${satellite.degradation}%` }}
                />
              </div>
            </div>

            {/* Status Message */}
            {satellite.health < 50 && (
              <p className="text-xs text-red-700 mt-2 flex items-center font-semibold">
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
        className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-lg"
      >
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Fleet Status Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {satellites.filter(s => s.health > 80).length}
            </p>
            <p className="text-xs text-gray-600">Healthy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {satellites.filter(s => s.health > 50 && s.health <= 80).length}
            </p>
            <p className="text-xs text-gray-600">Degraded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {satellites.filter(s => s.health <= 50).length}
            </p>
            <p className="text-xs text-gray-600">Critical</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SatelliteMonitor;