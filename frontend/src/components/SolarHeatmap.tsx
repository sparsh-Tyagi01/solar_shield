import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface HeatmapProps {
  data?: {
    intensity: number[][]; // 2D array of values from 0-100
    labels?: {
      x: string[];
      y: string[];
    };
  };
  title?: string;
  colorScheme?: 'solar' | 'radiation' | 'magnetic';
  showLegend?: boolean;
}

const SolarHeatmap: React.FC<HeatmapProps> = ({ 
  data, 
  title = 'Solar Activity Heatmap',
  colorScheme = 'solar',
  showLegend = true 
}) => {
  const [realTimeData, setRealTimeData] = useState<any>(null);

  useEffect(() => {
    // Fetch real historical data from API
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/historical/7d');
        const historicalData = response.data;
        
        // Transform historical data into heatmap format
        // Group data by day and hour
        const dayHourMap: { [key: string]: { [key: string]: number[] } } = {};
        
        historicalData.forEach((item: any) => {
          const timestamp = new Date(item.timestamp);
          const dayOfWeek = timestamp.getDay(); // 0-6 (Sunday-Saturday)
          const hour = timestamp.getHours(); // 0-23
          
          if (!dayHourMap[dayOfWeek]) {
            dayHourMap[dayOfWeek] = {};
          }
          if (!dayHourMap[dayOfWeek][hour]) {
            dayHourMap[dayOfWeek][hour] = [];
          }
          
          // Calculate solar activity intensity (0-100) based on space weather parameters
          const bzIntensity = Math.abs(item.bz) * 5; // Normalize Bz
          const speedIntensity = ((item.speed - 300) / 5); // Normalize speed
          const densityIntensity = (item.density * 3); // Normalize density
          const intensity = Math.min(100, Math.max(0, bzIntensity + speedIntensity + densityIntensity));
          
          dayHourMap[dayOfWeek][hour].push(intensity);
        });
        
        // Create 7x24 matrix (7 days x 24 hours)
        const intensity: number[][] = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let day = 0; day < 7; day++) {
          const row: number[] = [];
          for (let hour = 0; hour < 24; hour++) {
            if (dayHourMap[day] && dayHourMap[day][hour] && dayHourMap[day][hour].length > 0) {
              // Average all values for this day-hour combination
              const avg = dayHourMap[day][hour].reduce((a, b) => a + b, 0) / dayHourMap[day][hour].length;
              row.push(avg);
            } else {
              // No data for this slot
              row.push(0);
            }
          }
          intensity.push(row);
        }
        
        setRealTimeData({
          intensity,
          labels: {
            x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            y: dayNames
          }
        });
      } catch (error) {
        console.error('Error fetching historical data for heatmap:', error);
        // Will fall back to default data
      }
    };

    fetchHistoricalData();
    
    // Update every 10 minutes
    const interval = setInterval(fetchHistoricalData, 600000);
    
    return () => clearInterval(interval);
  }, []);

  // Default data if none provided and no real data fetched
  const defaultData = useMemo(() => {
    const intensity: number[][] = [];
    for (let i = 0; i < 7; i++) {
      const row: number[] = [];
      for (let j = 0; j < 24; j++) {
        // Create realistic solar activity patterns
        const baseValue = 30 + Math.sin(j / 24 * Math.PI * 2) * 20;
        const variation = Math.random() * 30;
        const solarCycle = Math.sin(i / 7 * Math.PI) * 15;
        row.push(Math.max(0, Math.min(100, baseValue + variation + solarCycle)));
      }
      intensity.push(row);
    }
    return {
      intensity,
      labels: {
        x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        y: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    };
  }, []);

  // Use real-time data if available, otherwise use provided data, otherwise use default
  const heatmapData = realTimeData || data || defaultData;

  // Color schemes for different types of solar data
  const getColorForValue = (value: number): string => {
    const schemes = {
      solar: [
        { threshold: 0, color: '#1e293b' },    // Dark blue-gray
        { threshold: 15, color: '#334155' },   // Lighter blue-gray
        { threshold: 30, color: '#fbbf24' },   // Yellow
        { threshold: 50, color: '#f97316' },   // Orange
        { threshold: 70, color: '#dc2626' },   // Red
        { threshold: 85, color: '#7c2d12' },   // Dark red
      ],
      radiation: [
        { threshold: 0, color: '#0f172a' },
        { threshold: 20, color: '#1e3a5f' },
        { threshold: 40, color: '#3b82f6' },
        { threshold: 60, color: '#8b5cf6' },
        { threshold: 80, color: '#ec4899' },
        { threshold: 90, color: '#fbbf24' },
      ],
      magnetic: [
        { threshold: 0, color: '#14532d' },
        { threshold: 20, color: '#166534' },
        { threshold: 40, color: '#22c55e' },
        { threshold: 60, color: '#84cc16' },
        { threshold: 80, color: '#facc15' },
        { threshold: 90, color: '#f97316' },
      ]
    };

    const scheme = schemes[colorScheme];
    for (let i = scheme.length - 1; i >= 0; i--) {
      if (value >= scheme[i].threshold) {
        return scheme[i].color;
      }
    }
    return scheme[0].color;
  };

  const getIntensityLabel = (value: number): string => {
    if (value < 20) return 'Low';
    if (value < 40) return 'Moderate';
    if (value < 60) return 'High';
    if (value < 80) return 'Very High';
    return 'Extreme';
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">Real-time solar activity intensity (last 7 days)</p>
      </div>

      <div className="glass-effect rounded-xl p-4 hover-lift">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* X-axis labels (top) */}
            <div className="flex mb-2">
              <div className="w-12"></div>
              {heatmapData.labels?.x.map((label: string, i: number) => (
                <div key={i} className="flex-1 min-w-[30px] text-center">
                  <span className="text-xs text-slate-400 font-medium">
                    {i % 4 === 0 ? label : ''}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Heatmap rows */}
            {heatmapData.intensity.map((row: number[], rowIndex: number) => (
              <div key={rowIndex} className="flex items-center mb-1">

                <div className="w-12 pr-2 text-right">
                  <span className="text-sm text-slate-300 font-medium">
                    {heatmapData.labels?.y[rowIndex]}
                  </span>
                </div>
                {row.map((value: number, colIndex: number) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: (rowIndex * row.length + colIndex) * 0.001,
                      duration: 0.3 
                    }}
                    whileHover={{ 
                      scale: 1.2, 
                      zIndex: 10,
                      transition: { duration: 0.2 }
                    }}
                    className="flex-1 min-w-[30px] aspect-square relative group cursor-pointer"
                  >
                    <div 
                      className="w-full h-full rounded-sm transition-all duration-200"
                      style={{ 
                        backgroundColor: getColorForValue(value),
                        boxShadow: value > 70 ? `0 0 10px ${getColorForValue(value)}` : 'none'
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20 border border-slate-700">
                        <div className="font-semibold">{getIntensityLabel(value)}</div>
                        <div className="text-slate-300">
                          {heatmapData.labels?.y[rowIndex]} {heatmapData.labels?.x[colIndex]}
                        </div>
                        <div className="text-solar-400 font-bold">{value.toFixed(1)}%</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 font-medium">Intensity Level:</span>
              <div className="flex items-center space-x-4">
                {['Low', 'Moderate', 'High', 'Very High', 'Extreme'].map((label, i) => (
                  <div key={label} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: getColorForValue(i * 20 + 10) }}
                    ></div>
                    <span className="text-xs text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarHeatmap;
