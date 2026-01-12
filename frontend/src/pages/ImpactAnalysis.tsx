import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';

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
      // Use current conditions endpoint to get latest data for prediction
      const conditionsResponse = await axios.get('http://localhost:8000/api/current-conditions');
      const conditions = conditionsResponse.data;
      
      // Make prediction with current conditions
      const response = await axios.post('http://localhost:8000/predict/impact', {
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-gray-800 text-2xl mb-2">Loading impact analysis...</div>
          <div className="text-gray-600 text-sm">Connecting to backend...</div>
        </div>
      </div>
    );
  }

  if (error && !impactData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-4">⚠️ Backend Not Connected</div>
          <div className="text-gray-600 text-sm mb-4">{error}</div>
          <div className="text-gray-500 text-xs">Start the backend with: uvicorn backend.main:app --reload</div>
          <button 
            onClick={fetchImpactData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
    // If affected, always show warning colors regardless of status
    if (affected) {
      return 'text-red-600';
    }
    switch (status) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MODERATE': return 'text-yellow-700';
      case 'LOW': return 'text-green-600';
      case 'MINIMAL': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string, affected: boolean) => {
    // If affected, always show danger colors
    if (affected) {
      return 'bg-red-100 border-red-600 text-red-700';
    }
    switch (status) {
      case 'CRITICAL': return 'bg-red-100 border-red-600 text-red-700';
      case 'HIGH': return 'bg-orange-100 border-orange-600 text-orange-700';
      case 'MODERATE': return 'bg-yellow-100 border-yellow-600 text-yellow-800';
      case 'LOW': return 'bg-green-100 border-green-600 text-green-700';
      case 'MINIMAL': return 'bg-blue-100 border-blue-600 text-blue-700';
      default: return 'bg-gray-100 border-gray-600 text-gray-700';
    }
  };

  const affectedCount = impactData?.affected_systems?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Infrastructure Impact Analysis
        </h1>
        <p className="text-gray-600">
          Risk assessment for critical systems
        </p>
        {error && (
          <div className="mt-2 text-orange-600 text-sm">⚠ {error}</div>
        )}
      </motion.div>

      {/* Summary Alert */}
      {affectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-red-50 border-2 border-red-600 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="text-red-600 text-2xl">⚠</div>
            <div>
              <h3 className="text-red-700 font-semibold text-lg">
                {affectedCount} System{affectedCount > 1 ? 's' : ''} at Risk
              </h3>
              <p className="text-gray-700 text-sm">
                Affected: {impactData?.affected_systems.join(', ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#d1d5db" />
              <PolarAngleAxis dataKey="category" stroke="#4b5563" style={{ fontSize: '14px', fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#4b5563" />
              <Radar 
                name="Risk Level" 
                dataKey="risk" 
                stroke="#dc2626" 
                fill="#ef4444" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Impact Details
          </h2>
          <div className="space-y-4">
            {radarData.map((item) => (
              <div key={item.category} className="relative">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-medium">{item.category}</span>
                    {item.affected && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border-2 border-red-600">
                        AFFECTED
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${getStatusColor(item.status, item.affected)}`}>
                    {item.risk.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      item.affected ? 'bg-red-600 animate-pulse' :
                      item.risk > 70 ? 'bg-red-600' : 
                      item.risk > 40 ? 'bg-orange-600' : 
                      item.risk > 20 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${item.risk}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <span className={`text-xs font-semibold ${getStatusColor(item.status, item.affected)}`}>
                    {item.affected ? 'AFFECTED - ' : ''}{item.status}
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
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg p-4 border-2 shadow-lg ${
              item.affected ? 'border-red-600 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{item.category}</h3>
              {item.affected && (
                <div className="text-red-600 text-2xl animate-pulse">⚠️</div>
              )}
            </div>
            
            <div className={`text-3xl font-bold mb-2 ${getStatusColor(item.status, item.affected)}`}>
              {item.risk.toFixed(0)}%
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusBadgeColor(item.status, item.affected)}`}>
              {item.affected ? '⚠ AFFECTED' : item.status}
            </div>
            
            <div className={`mt-3 text-xs font-semibold ${item.affected ? 'text-red-700' : 'text-gray-600'}`}>
              {item.affected ? 
                '🔴 System is currently at risk' : 
                '✓ System operating normally'
              }
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timestamp */}
      {impactData?.timestamp && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Last updated: {new Date(impactData.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
