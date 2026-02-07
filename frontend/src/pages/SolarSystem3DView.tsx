import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolarSystemVisualization from '../components/SolarSystemVisualization';
import { useWebSocket } from '../context/WebSocketContext';
import axios from 'axios';

const SolarSystem3DView: React.FC = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [satellites, setSatellites] = useState<any[]>([]);
  const [radiationLevel, setRadiationLevel] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(1.0);
  const [showInfo, setShowInfo] = useState(true);
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
    if (currentData) {
      const bz = currentData.bz || 0;
      const speed = currentData.speed || 400;
      const density = currentData.density || 5;
      const radiation = Math.abs(bz) + (speed - 400) / 50 + density;
      setRadiationLevel(radiation);

      const fieldStrength = bz < 0 ? Math.max(0.3, 1.0 + (bz / 20)) : 1.0 + (bz / 100);
      setMagneticFieldStrength(fieldStrength);
    }
  }, [currentData]);

  const fetchCurrentData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/current-conditions');
      setCurrentData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSatelliteUpdate = (updatedSatellites: any[]) => {
    setSatellites(updatedSatellites);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-screen 3D visualization */}
      <SolarSystemVisualization
        radiationLevel={radiationLevel}
        bzValue={currentData?.bz || 0}
        solarWindSpeed={currentData?.speed || 400}
        protonFlux={currentData?.proton_flux || 1.0}
        xrayFlux={currentData?.xray_flux || 1e-6}
        magneticFieldStrength={magneticFieldStrength}
        onSatelliteUpdate={handleSatelliteUpdate}
      />

      {/* Toggle button */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-4 right-4 z-10 bg-slate-800/80 backdrop-blur-lg text-white px-4 py-2 rounded-lg border border-purple-500/30 hover:bg-slate-700/80 transition-all"
      >
        {showInfo ? 'Hide Info' : 'Show Info'}
      </button>

      {/* Overlay information panel */}
      {showInfo && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="absolute left-4 top-4 bottom-4 w-80 bg-slate-800/80 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20 overflow-y-auto z-10"
        >
          <h1 className="text-2xl font-bold text-white mb-4">
            Solar System View
          </h1>

          {/* Current conditions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Space Weather Conditions
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Solar Wind Speed:</span>
                <span className="text-white font-semibold">
                  {currentData?.speed?.toFixed(0) || '---'} km/s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Bz Component:</span>
                <span className={`font-semibold ${currentData?.bz < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {currentData?.bz?.toFixed(2) || '---'} nT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Density:</span>
                <span className="text-white font-semibold">
                  {currentData?.density?.toFixed(1) || '---'} p/cm³
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Radiation Level:</span>
                <span className={`font-semibold ${
                  radiationLevel > 15 ? 'text-red-400' :
                  radiationLevel > 10 ? 'text-orange-400' :
                  radiationLevel > 5 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {radiationLevel.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Magnetic Field:</span>
                <span className="text-white font-semibold">
                  {(magneticFieldStrength * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Satellites */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Satellite Status ({satellites.length})
            </h3>
            <div className="space-y-3">
              {satellites.map((sat) => (
                <div key={sat.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium text-sm">{sat.name}</span>
                    <span className={`text-xs font-semibold ${
                      sat.health > 80 ? 'text-green-400' :
                      sat.health > 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {sat.health.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        sat.health > 80 ? 'bg-green-500' :
                        sat.health > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sat.health}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>{sat.type}</span>
                    <span>{sat.altitude} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Legend
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Sun with dynamic radiation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Earth with magnetic field</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Moon in realistic orbit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Healthy satellite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Degraded satellite</span>
              </div>
              <div className="mt-3 p-3 bg-purple-500/20 rounded border border-purple-500/40">
                <p className="text-xs">
                  <strong>Radiation Effects:</strong> Solar particles (orange) travel from Sun to Earth. 
                  Magnetic field (blue lines) protects Earth. When Bz is negative, field weakens (turns red).
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 p-3 bg-slate-700/50 rounded">
            <p className="text-xs text-gray-300">
              <strong>Controls:</strong><br/>
              • Left click + drag to rotate<br/>
              • Right click + drag to pan<br/>
              • Scroll to zoom in/out<br/>
              • All movements based on real data
            </p>
          </div>
        </motion.div>
      )}

      {/* Bottom info bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur-lg rounded-lg px-6 py-3 border border-purple-500/20 z-10"
      >
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-300">Live Data</span>
          </div>
          <div className="text-gray-300">
            Satellites: <span className="text-white font-semibold">{satellites.length}</span>
          </div>
          <div className="text-gray-300">
            Radiation: <span className={`font-semibold ${
              radiationLevel > 10 ? 'text-red-400' : 'text-green-400'
            }`}>{radiationLevel.toFixed(1)}</span>
          </div>
          <div className="text-gray-300">
            Solar Wind: <span className="text-white font-semibold">
              {currentData?.speed?.toFixed(0) || '---'} km/s
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SolarSystem3DView;
