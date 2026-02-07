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
      <div className="glass-effect rounded-xl p-8 text-center">
        <div className="animate-pulse">
          <div className="text-slate-300 font-display text-lg">Loading real-time data...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Solar Wind Speed',
      value: data.speed || 0,
      unit: 'km/s',
      icon: ArrowTrendingUpIcon,
      color: data.speed > 500 ? 'text-red-400' : 'text-aurora-400',
      gradient: data.speed > 500 ? 'from-red-500/20 to-red-600/20' : 'from-aurora-500/20 to-aurora-600/20',
      borderColor: data.speed > 500 ? 'border-red-500/50' : 'border-aurora-500/50',
      status: data.speed > 500 ? 'High' : 'Normal',
      description: 'Speed of solar wind particles',
    },
    {
      label: 'IMF Bz Component',
      value: data.bz || 0,
      unit: 'nT',
      icon: data.bz < 0 ? ArrowTrendingDownIcon : ArrowTrendingUpIcon,
      color: data.bz < -10 ? 'text-red-400' : 'text-blue-400',
      gradient: data.bz < -10 ? 'from-red-500/20 to-red-600/20' : 'from-blue-500/20 to-blue-600/20',
      borderColor: data.bz < -10 ? 'border-red-500/50' : 'border-blue-500/50',
      status: data.bz < -10 ? 'Southward' : 'Northward',
      description: 'Interplanetary magnetic field',
    },
    {
      label: 'Proton Density',
      value: data.density || 0,
      unit: 'p/cm³',
      icon: BoltIcon,
      color: data.density > 10 ? 'text-solar-400' : 'text-aurora-400',
      gradient: data.density > 10 ? 'from-solar-500/20 to-solar-600/20' : 'from-aurora-500/20 to-aurora-600/20',
      borderColor: data.density > 10 ? 'border-solar-500/50' : 'border-aurora-500/50',
      status: data.density > 10 ? 'Elevated' : 'Normal',
      description: 'Proton particles per cubic cm',
    },
    {
      label: 'Kp Index',
      value: data.kp_index || 0,
      unit: '',
      icon: SignalIcon,
      color: data.kp_index > 5 ? 'text-red-400' : 'text-yellow-400',
      gradient: data.kp_index > 5 ? 'from-red-500/20 to-red-600/20' : 'from-yellow-500/20 to-yellow-600/20',
      borderColor: data.kp_index > 5 ? 'border-red-500/50' : 'border-yellow-500/50',
      status: data.kp_index > 5 ? 'Storm' : 'Quiet',
      description: 'Geomagnetic activity index',
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
          whileHover={{ scale: 1.02, y: -4 }}
          className={`
            glass-effect rounded-xl p-5 
            bg-gradient-to-br ${metric.gradient}
            border ${metric.borderColor}
            hover-lift cursor-pointer
            group relative overflow-hidden
          `}
        >
          {/* Background glow effect on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white text-base font-display font-semibold mb-1">
                  {metric.label}
                </h3>
                <p className="text-slate-400 text-xs">{metric.description}</p>
              </div>
              <metric.icon className={`w-7 h-7 ${metric.color} group-hover:animate-pulse`} />
            </div>
            
            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className={`text-4xl font-bold font-display ${metric.color}`}>
                  {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                </span>
                <span className="text-slate-300 ml-2 text-sm font-medium">{metric.unit}</span>
              </div>
              <span className={`
                text-xs px-3 py-1.5 rounded-full font-semibold 
                ${metric.color} 
                bg-slate-900/60 backdrop-blur-sm
                border ${metric.borderColor}
                group-hover:shadow-lg transition-all
              `}>
                {metric.status}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RealTimeMetrics;
