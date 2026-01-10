import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface RadiationChartProps {
  currentRadiation: number;
}

const RadiationChart: React.FC<RadiationChartProps> = ({ currentRadiation }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with some historical data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}m ago`,
      radiation: Math.random() * 10 + 2,
      threshold: 10,
      critical: 15
    }));
    setData(initialData);
  }, []);

  useEffect(() => {
    // Add new data point every few seconds
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1), {
          time: 'Now',
          radiation: currentRadiation,
          threshold: 10,
          critical: 15
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentRadiation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        Solar Radiation Exposure (Real-Time)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="radiationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6600" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff6600" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" stroke="#999" />
          <YAxis stroke="#999" label={{ value: 'Radiation (units)', angle: -90, position: 'insideLeft', fill: '#999' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="radiation" 
            stroke="#ff6600" 
            fill="url(#radiationGradient)"
            name="Radiation Level"
          />
          <Line 
            type="monotone" 
            dataKey="threshold" 
            stroke="#ffaa00" 
            strokeDasharray="5 5"
            name="Warning Threshold"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#ff0000" 
            strokeDasharray="5 5"
            name="Critical Threshold"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400">Current</p>
          <p className={`text-lg font-bold ${
            currentRadiation > 15 ? 'text-red-400' :
            currentRadiation > 10 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {currentRadiation.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Peak (24h)</p>
          <p className="text-lg font-bold text-purple-400">
            {Math.max(...data.map(d => d.radiation)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Average</p>
          <p className="text-lg font-bold text-blue-400">
            {(data.reduce((sum, d) => sum + d.radiation, 0) / data.length).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RadiationChart;