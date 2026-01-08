import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Historical Data
        </h1>
        <p className="text-gray-300">
          Solar wind and geomagnetic activity archive
        </p>
      </motion.div>

      <div className="mb-6 flex space-x-2">
        {['24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white text-center py-8">Loading data...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 shadow-2xl border border-purple-500/20"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="speed" stroke="#8b5cf6" name="Speed (km/s)" />
              <Line type="monotone" dataKey="bz" stroke="#3b82f6" name="Bz (nT)" />
              <Line type="monotone" dataKey="density" stroke="#10b981" name="Density (p/cm³)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default HistoricalData;
