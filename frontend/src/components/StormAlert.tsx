import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  level: string;
  probability: number;
  severity?: number;
}

const StormAlert: React.FC<AlertProps> = ({ level, probability, severity = 0 }) => {
  const alertConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: ExclamationTriangleIcon,
      message: 'CRITICAL: Major geomagnetic storm imminent',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      text: 'text-orange-700',
      icon: ExclamationTriangleIcon,
      message: 'WARNING: Moderate storm conditions expected',
    },
    watch: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: ExclamationTriangleIcon,
      message: 'WATCH: Minor storm activity possible',
    },
    normal: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: ShieldCheckIcon,
      message: 'All systems normal - No storm activity',
    },
  };

  const config = alertConfig[level as keyof typeof alertConfig] || alertConfig.normal;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} border-2 rounded-lg p-6 mb-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Icon className={`w-8 h-8 ${config.text}`} />
          <div>
            <h3 className={`text-xl font-bold ${config.text}`}>
              {config.message}
            </h3>
            <p className="text-slate-700 mt-1">
              Storm Probability: <span className="font-semibold">{(probability * 100).toFixed(1)}%</span>
              {severity > 0 && (
                <span className="ml-4">
                  Severity Score: <span className="font-semibold">{severity.toFixed(2)}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StormAlert;
