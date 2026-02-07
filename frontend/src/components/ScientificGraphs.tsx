import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from 'axios';

interface ScientificGraphsProps {
  currentData?: any;
}

const ScientificGraphs: React.FC<ScientificGraphsProps> = ({ currentData }) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real historical data from API
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/historical/24h');
        const data = response.data;
        
        // Format data for charts
        const formattedData = data.map((item: any) => {
          const timestamp = new Date(item.timestamp);
          return {
            time: timestamp.toTimeString().substring(0, 5),
            speed: item.speed || 400,
            bz: item.bz || 0,
            density: item.density || 5,
            kp: item.kp_index || 3,
          };
        });
        
        setHistoricalData(formattedData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        // Fallback to mock data if API fails
        setHistoricalData(generateMockData());
      }
    };

    const generateMockData = () => {
      const data = [];
      const now = Date.now();
      
      for (let i = 48; i >= 0; i--) {
        const time = new Date(now - i * 30 * 60 * 1000);
        const baseSpeed = 450 + Math.sin(i * 0.2) * 100;
        const baseBz = -5 + Math.sin(i * 0.15) * 10;
        const baseDensity = 8 + Math.sin(i * 0.25) * 4;
        
        data.push({
          time: time.toTimeString().substring(0, 5),
          speed: Math.max(300, baseSpeed + (Math.random() - 0.5) * 50),
          bz: baseBz + (Math.random() - 0.5) * 5,
          density: Math.max(1, baseDensity + (Math.random() - 0.5) * 2),
          kp: Math.max(0, Math.min(9, 3 + Math.sin(i * 0.1) * 2 + (Math.random() - 0.5))),
        });
      }
      
      return data;
    };

    fetchHistoricalData();
    
    // Update every 5 minutes
    const interval = setInterval(() => {
      fetchHistoricalData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="mission-panel p-3 text-xs">
          <p className="text-space-50 font-mono mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-mono" style={{ color: entry.color }}>
              {entry.name}: <span className="data-value">{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Top: Solar Wind Velocity - Full Width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mission-panel p-4 hover:border-cyan-500/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider">
            Solar Wind Velocity
          </h3>
          <div className="text-right">
            <div className="data-value text-xl font-bold">
              {currentData?.speed?.toFixed(0) || 450}
            </div>
            <div className="text-cyber-cyan text-xs font-mono">km/s</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
              interval={4}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
              domain={[300, 800]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={500} stroke="#ffb020" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="speed" 
              stroke="#00d9ff" 
              strokeWidth={2}
              fill="url(#speedGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Second Row: Proton Density and IMF Bz */}
      <div className="grid grid-cols-2 gap-4">
        {/* Proton Density */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mission-panel p-4 hover:border-cyan-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider">
              Proton Density
            </h3>
            <div className="text-right">
              <div className="data-value text-xl font-bold">
                {currentData?.density?.toFixed(1) || 8.0}
              </div>
              <div className="text-cyber-cyan text-xs font-mono">p/cm³</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4d7cff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4d7cff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
                interval={6}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="density" 
                stroke="#4d7cff" 
                strokeWidth={2}
                fill="url(#densityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* IMF Bz Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mission-panel p-4 hover:border-cyan-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider">
              IMF Bz Component
            </h3>
            <div className="text-right">
              <div className={`text-xl font-bold font-mono ${currentData?.bz < -10 ? 'text-cyber-red' : 'text-cyber-green'}`} 
                  style={{ textShadow: '0 0 10px currentColor' }}>
                {currentData?.bz?.toFixed(1) || -5.0}
              </div>
              <div className="text-cyber-cyan text-xs font-mono">nT</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={historicalData}>
              <defs>
                <linearGradient id="bzGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4444" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#4d7cff" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
                interval={6}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
                domain={[-20, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
              <ReferenceLine y={-10} stroke="#ff4444" strokeDasharray="3 3" label={{ value: 'Critical', fill: '#ff4444', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="bz" 
                stroke="url(#bzGradient)" 
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom: Kp Index - Full Width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mission-panel p-4 hover:border-cyan-500/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider">
            Kp Index
          </h3>
          <div className="text-right">
            <div className={`text-xl font-bold font-mono ${currentData?.kp_index > 5 ? 'text-cyber-red' : 'text-cyber-green'}`}
                 style={{ textShadow: '0 0 10px currentColor' }}>
              {currentData?.kp_index?.toFixed(0) || 3}
            </div>
            <div className="text-cyber-cyan text-xs font-mono">Index</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb020" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ffb020" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
              interval={4}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '9px', fontFamily: 'Roboto Mono' }}
              domain={[0, 9]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={5} stroke="#ff4444" strokeDasharray="3 3" />
            <Area 
              type="stepAfter" 
              dataKey="kp" 
              stroke="#ffb020" 
              strokeWidth={2}
              fill="url(#kpGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ScientificGraphs;
