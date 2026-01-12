import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  SignalIcon,
} from '@heroicons/react/24/solid';

interface MetricsProps {
  data: any;
}

const RealTimeMetrics: React.FC<MetricsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-gray-600 text-center py-8">
        Loading real-time data...
      </div>
    );
  }

  const metrics = [
    {
      label: 'Solar Wind Speed',
      value: data.speed || 0,
      unit: 'km/s',
      icon: ArrowTrendingUpIcon,
      color: data.speed > 500 ? 'text-red-600' : 'text-green-600',
      bgColor: data.speed > 500 ? 'bg-red-50' : 'bg-green-50',
      status: data.speed > 500 ? 'High' : 'Normal',
    },
    {
      label: 'IMF Bz Component',
      value: data.bz || 0,
      unit: 'nT',
      icon: data.bz < 0 ? ArrowTrendingDownIcon : ArrowTrendingUpIcon,
      color: data.bz < -10 ? 'text-red-600' : 'text-blue-600',
      bgColor: data.bz < -10 ? 'bg-red-50' : 'bg-blue-50',
      status: data.bz < -10 ? 'Southward' : 'Northward',
    },
    {
      label: 'Proton Density',
      value: data.density || 0,
      unit: 'p/cm³',
      icon: BoltIcon,
      color: data.density > 10 ? 'text-orange-600' : 'text-green-600',
      bgColor: data.density > 10 ? 'bg-orange-50' : 'bg-green-50',
      status: data.density > 10 ? 'Elevated' : 'Normal',
    },
    {
      label: 'Kp Index',
      value: data.kp_index || 0,
      unit: '',
      icon: SignalIcon,
      color: data.kp_index > 5 ? 'text-red-600' : 'text-yellow-600',
      bgColor: data.kp_index > 5 ? 'bg-red-50' : 'bg-yellow-50',
      status: data.kp_index > 5 ? 'Storm' : 'Quiet',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${metric.bgColor} rounded-lg p-4 border-2 ${metric.color.replace('text', 'border')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-700 text-sm font-medium">{metric.label}</span>
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className={`text-3xl font-bold ${metric.color}`}>
                {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
              </span>
              <span className="text-slate-600 ml-2 text-sm">{metric.unit}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-semibold ${metric.color} bg-white`}>
              {metric.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RealTimeMetrics;
