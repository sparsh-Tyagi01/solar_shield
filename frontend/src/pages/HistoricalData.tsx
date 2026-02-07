import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Clock, TrendingUp, Activity } from 'lucide-react';

const HistoricalData: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/historical/${timeRange}`);
      const formattedData = response.data.map((item: any) => ({
        ...item,
        time: format(new Date(item.timestamp), timeRange === '24h' ? 'HH:mm' : 'MM/dd HH:mm'),
      }));
      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setLoading(false);
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
            Historical Data Archive
          </h1>
          <p className="text-gray-400 text-lg font-mono uppercase tracking-widest">
            Solar Wind • Geomagnetic Activity • Time-Series Analysis
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex space-x-3"
        >
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 glow-cyan'
                  : 'bg-gray-800/50 text-gray-300 border border-cyan-500/30 hover:bg-gray-700/50 hover:border-cyan-500/50 hover:text-cyan-400 backdrop-blur-md'
              }`}
            >
              {range}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="data-value text-xl mb-2">Loading Historical Data</div>
              <div className="text-gray-400 text-sm font-mono uppercase tracking-wider">Analyzing Time Series...</div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mission-panel p-6 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-cyber-cyan uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-6 h-6" />
                <span>Solar Wind Parameters</span>
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Live Data</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#e4e4e7" 
                  style={{ fontSize: '12px', fontFamily: 'monospace', fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#e4e4e7" 
                  style={{ fontSize: '12px', fontFamily: 'monospace', fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#e4e4e7',
                    boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                  labelStyle={{ color: '#00d9ff', fontWeight: 'bold', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#e4e4e7', fontFamily: 'monospace' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: '#9ca3af', 
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    paddingTop: '20px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#00d9ff" 
                  name="Speed (km/s)" 
                  strokeWidth={3}
                  dot={{ fill: '#00d9ff', r: 3 }}
                  activeDot={{ r: 6, fill: '#00ffff', stroke: '#00d9ff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bz" 
                  stroke="#ff4444" 
                  name="Bz (nT)" 
                  strokeWidth={3}
                  dot={{ fill: '#ff4444', r: 3 }}
                  activeDot={{ r: 6, fill: '#ff6b35', stroke: '#ff4444', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="density" 
                  stroke="#00ff88" 
                  name="Density (p/cm³)" 
                  strokeWidth={3}
                  dot={{ fill: '#00ff88', r: 3 }}
                  activeDot={{ r: 6, fill: '#00ffaa', stroke: '#00ff88', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 pt-4 border-t border-cyan-500/20">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Data Points</div>
                  <div className="data-value text-xl">{data.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Time Range</div>
                  <div className="data-value text-xl">{timeRange}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Update Frequency</div>
                  <div className="data-value text-xl">Real-Time</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mission-panel p-5 rounded-xl backdrop-blur-md hover-lift"
            >
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400">Avg Speed</h3>
              </div>
              <div className="data-value text-3xl">
                {(data.reduce((sum, d) => sum + d.speed, 0) / data.length).toFixed(0)} km/s
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mission-panel p-5 rounded-xl backdrop-blur-md hover-lift"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Activity className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400">Avg Bz</h3>
              </div>
              <div className="data-value text-3xl" style={{ color: '#ff4444' }}>
                {(data.reduce((sum, d) => sum + d.bz, 0) / data.length).toFixed(2)} nT
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mission-panel p-5 rounded-xl backdrop-blur-md hover-lift"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400">Avg Density</h3>
              </div>
              <div className="data-value text-3xl" style={{ color: '#00ff88' }}>
                {(data.reduce((sum, d) => sum + d.density, 0) / data.length).toFixed(2)} p/cm³
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalData;
