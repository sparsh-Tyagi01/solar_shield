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
      className="bg-white rounded-lg p-6 border-2 border-gray-200 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Solar Radiation Exposure (Real-Time)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="radiationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#4b5563" style={{ fontSize: '14px', fontWeight: 500 }} />
          <YAxis stroke="#4b5563" label={{ value: 'Radiation (units)', angle: -90, position: 'insideLeft', fill: '#4b5563' }} style={{ fontSize: '14px', fontWeight: 500 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              color: '#1f2937'
            }}
          />
          <Legend wrapperStyle={{ color: '#4b5563', fontWeight: 500 }} />
          <Area 
            type="monotone" 
            dataKey="radiation" 
            stroke="#dc2626" 
            fill="url(#radiationGradient)"
            name="Radiation Level"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="threshold" 
            stroke="#ea580c" 
            strokeDasharray="5 5"
            name="Warning Threshold"
            dot={false}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#b91c1c" 
            strokeDasharray="5 5"
            name="Critical Threshold"
            dot={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-600 font-medium">Current</p>
          <p className={`text-lg font-bold ${
            currentRadiation > 15 ? 'text-red-600' :
            currentRadiation > 10 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {currentRadiation.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Peak (24h)</p>
          <p className="text-lg font-bold text-red-600">
            {Math.max(...data.map(d => d.radiation)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Average</p>
          <p className="text-lg font-bold text-blue-600">
            {(data.reduce((sum, d) => sum + d.radiation, 0) / data.length).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RadiationChart;