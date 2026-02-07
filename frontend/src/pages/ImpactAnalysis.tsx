import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../config/api';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';
import { Shield, AlertTriangle, Satellite, Radio, Zap } from 'lucide-react';

interface ImpactCategory {
  risk: number;
  status: string;
  affected: boolean;
}

interface ImpactData {
  satellites: ImpactCategory;
  gps: ImpactCategory;
  communication: ImpactCategory;
  power_grid: ImpactCategory;
  affected_systems: string[];
  timestamp: string;
}

const ImpactAnalysis: React.FC = () => {
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImpactData();
    const interval = setInterval(fetchImpactData, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchImpactData = async () => {
    try {
      const conditionsResponse = await axios.get(API.currentConditions);
      const conditions = conditionsResponse.data;
      
      const response = await axios.post(API.predictImpact, {
        bz: conditions.bz,
        speed: conditions.speed,
        density: conditions.density,
        pressure: conditions.pressure,
        xray_flux: conditions.xray_flux,
        proton_flux: conditions.proton_flux
      });
      
      console.log('Impact Analysis: Raw backend response:', response.data);
      console.log('Impact Analysis: Affected systems:', response.data.affected_systems);
      console.log('Impact Analysis: Satellites data:', response.data.satellites);
      
      setImpactData(response.data);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching impact data:', error);
      setError('Failed to connect to backend. Please ensure the server is running.');
      setImpactData(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="data-value text-2xl mb-2">Analyzing Infrastructure Impact</div>
          <div className="text-gray-400 text-sm font-mono uppercase tracking-wider">Connecting to Mission Control...</div>
        </div>
      </div>
    );
  }

  if (error && !impactData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center mission-panel p-8 rounded-2xl max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <div className="text-red-400 text-2xl font-display font-bold mb-4">⚠️ Backend Not Connected</div>
          <div className="text-gray-400 text-sm mb-4 font-mono">{error}</div>
          <div className="text-gray-500 text-xs mb-6 font-mono">Start the backend with: uvicorn backend.main:app --reload</div>
          <button 
            onClick={fetchImpactData}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-display font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { 
      category: 'Satellites', 
      risk: (impactData?.satellites?.risk || 0) * 100,
      status: impactData?.satellites?.status || 'UNKNOWN',
      affected: impactData?.satellites?.affected || false
    },
    { 
      category: 'GPS', 
      risk: (impactData?.gps?.risk || 0) * 100,
      status: impactData?.gps?.status || 'UNKNOWN',
      affected: impactData?.gps?.affected || false
    },
    { 
      category: 'Communication', 
      risk: (impactData?.communication?.risk || 0) * 100,
      status: impactData?.communication?.status || 'UNKNOWN',
      affected: impactData?.communication?.affected || false
    },
    { 
      category: 'Power Grid', 
      risk: (impactData?.power_grid?.risk || 0) * 100,
      status: impactData?.power_grid?.status || 'UNKNOWN',
      affected: impactData?.power_grid?.affected || false
    },
  ];

  const getStatusColor = (status: string, affected: boolean) => {
    if (affected) return 'text-red-400';
    switch (status) {
      case 'CRITICAL': return 'text-red-400';
      case 'HIGH': return 'text-orange-400';
      case 'MODERATE': return 'text-amber-400';
      case 'LOW': return 'text-green-400';
      case 'MINIMAL': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string, affected: boolean) => {
    if (affected) return 'bg-red-500/20 border-red-500/50 text-red-400';
    switch (status) {
      case 'CRITICAL': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'HIGH': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'MODERATE': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'LOW': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'MINIMAL': return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const affectedCount = impactData?.affected_systems?.length || 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Satellites': return <Satellite className="w-5 h-5" />;
      case 'GPS': return <Radio className="w-5 h-5" />;
      case 'Communication': return <Radio className="w-5 h-5" />;
      case 'Power Grid': return <Zap className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header with Gradient Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-display font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent mb-3 uppercase tracking-wider">
            Infrastructure Impact Analysis
          </h1>
          <p className="text-gray-400 text-lg font-mono uppercase tracking-widest">
            Risk Assessment • Critical Systems • Real-Time Monitoring
          </p>
          {error && (
            <div className="mt-3 text-amber-400 text-sm font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>⚠ {error}</span>
            </div>
          )}
        </motion.div>

        {/* Summary Alert */}
        {affectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-900/30 backdrop-blur-md border border-red-500/50 rounded-xl p-5"
          >
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-red-400 font-display font-bold text-xl uppercase tracking-wider">
                  {affectedCount} System{affectedCount > 1 ? 's' : ''} at Risk
                </h3>
                <p className="text-gray-300 text-sm font-mono mt-1">
                  Affected: {impactData?.affected_systems.join(', ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mission-panel p-6 rounded-2xl backdrop-blur-xl hover-lift"
          >
            <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Risk Distribution</span>
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(0, 217, 255, 0.2)" />
                <PolarAngleAxis 
                  dataKey="category" 
                  stroke="#e4e4e7" 
                  style={{ fontSize: '12px', fontFamily: 'monospace', fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  stroke="#e4e4e7"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <Radar 
                  name="Risk Level" 
                  dataKey="risk" 
                  stroke="#ff4444" 
                  fill="#ff4444" 
                  fillOpacity={0.5} 
                  strokeWidth={3}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(255, 68, 68, 0.5)',
                    borderRadius: '12px',
                    color: '#e4e4e7',
                    boxShadow: '0 0 20px rgba(255, 68, 68, 0.2)',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#ff4444', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Impact Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mission-panel p-6 rounded-2xl backdrop-blur-xl hover-lift"
          >
            <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider mb-6">
              Impact Details
            </h2>
            <div className="space-y-5">
              {radarData.map((item) => (
                <div key={item.category} className="relative">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-100 font-display font-semibold text-sm uppercase tracking-wider">{item.category}</span>
                      {item.affected && (
                        <span className="text-[10px] bg-red-500/30 text-red-400 px-2 py-0.5 rounded-full border border-red-500/50 font-mono uppercase">
                          AFFECTED
                        </span>
                      )}
                    </div>
                    <span className={`font-mono font-bold text-lg ${getStatusColor(item.status, item.affected)}`}>
                      {item.risk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/50">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.affected ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' :
                        item.risk > 70 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 
                        item.risk > 40 ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 
                        item.risk > 20 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                        'bg-gradient-to-r from-green-500 to-cyan-500'
                      }`}
                      style={{ width: `${item.risk}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${getStatusColor(item.status, item.affected)}`}>
                      {item.affected ? 'AFFECTED • ' : ''}{item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed System Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {radarData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`mission-panel p-5 rounded-xl backdrop-blur-md hover-lift ${
                item.affected ? 'border-red-500/70 bg-red-900/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={item.affected ? 'text-red-400' : 'text-cyan-400'}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <h3 className="text-base font-display font-bold text-gray-100 uppercase tracking-wide">{item.category}</h3>
                </div>
                {item.affected && (
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                )}
              </div>
              
              <div className={`text-4xl font-mono font-black mb-3 ${getStatusColor(item.status, item.affected)}`}>
                {item.risk.toFixed(0)}%
              </div>
              
              <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-mono font-bold border backdrop-blur-md ${getStatusBadgeColor(item.status, item.affected)} uppercase tracking-wider`}>
                {item.affected ? '⚠ AFFECTED' : item.status}
              </div>
              
              <div className={`mt-4 text-xs font-mono font-semibold ${item.affected ? 'text-red-400' : 'text-gray-400'} uppercase tracking-wider`}>
                {item.affected ? 
                  '🔴 System at Risk' : 
                  '✓ Operational'
                }
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timestamp */}
        {impactData?.timestamp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-sm text-gray-500 font-mono uppercase tracking-wider"
          >
            Last Updated: {new Date(impactData.timestamp).toLocaleString()} UTC
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImpactAnalysis;
