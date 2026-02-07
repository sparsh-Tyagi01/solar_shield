import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';
import { API } from '../config/api';

const SolarWindChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchHistoricalData();
    const interval = setInterval(fetchHistoricalData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(API.historical('24h'));
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#475569" style={{ fontSize: '12px' }} />
        <YAxis stroke="#475569" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
        <Line type="monotone" dataKey="speed" stroke="#2563eb" strokeWidth={2} name="Speed (km/s)" dot={false} />
        <Line type="monotone" dataKey="bz" stroke="#dc2626" strokeWidth={2} name="Bz (nT)" dot={false} />
        <Line type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} name="Density (p/cm³)" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SolarWindChart;
