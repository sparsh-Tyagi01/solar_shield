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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Historical Data
        </h1>
        <p className="text-gray-600">
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
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-800 text-center py-8">Loading data...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#4b5563" style={{ fontSize: '14px', fontWeight: 500 }} />
              <YAxis stroke="#4b5563" style={{ fontSize: '14px', fontWeight: 500 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
              />
              <Legend wrapperStyle={{ color: '#4b5563', fontWeight: 500 }} />
              <Line type="monotone" dataKey="speed" stroke="#2563eb" name="Speed (km/s)" strokeWidth={2} />
              <Line type="monotone" dataKey="bz" stroke="#dc2626" name="Bz (nT)" strokeWidth={2} />
              <Line type="monotone" dataKey="density" stroke="#059669" name="Density (p/cm³)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default HistoricalData;
