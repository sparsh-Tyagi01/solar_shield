import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

const SolarWindChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchHistoricalData();
    const interval = setInterval(fetchHistoricalData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/historical/24h');
      const formattedData = response.data.map((item: any) => ({
        ...item,
        time: format(new Date(item.timestamp), 'HH:mm'),
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
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
  );
};

export default SolarWindChart;
