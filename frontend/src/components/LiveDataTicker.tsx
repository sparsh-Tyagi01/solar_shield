import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LiveDataTickerProps {
  data: any;
}

const LiveDataTicker: React.FC<LiveDataTickerProps> = ({ data }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUTC = (date: Date) => {
    return date.toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
  };

  const metrics = [
    {
      label: 'SOLAR WIND',
      value: data?.speed || 0,
      unit: 'km/s',
      status: data?.speed > 500 ? 'HIGH' : data?.speed > 400 ? 'NOMINAL' : 'LOW',
      critical: data?.speed > 700,
    },
    {
      label: 'IMF Bz',
      value: data?.bz || 0,
      unit: 'nT',
      status: data?.bz < -10 ? 'SOUTHWARD' : data?.bz < 0 ? 'WEAK SOUTH' : 'NORTHWARD',
      critical: data?.bz < -15,
    },
    {
      label: 'Kp INDEX',
      value: data?.kp_index || 0,
      unit: '',
      status: data?.kp_index > 5 ? 'STORM' : data?.kp_index > 3 ? 'ACTIVE' : 'QUIET',
      critical: data?.kp_index > 7,
    },
    {
      label: 'PROTON DENSITY',
      value: data?.density || 0,
      unit: 'p/cm³',
      status: data?.density > 15 ? 'ELEVATED' : 'NOMINAL',
      critical: data?.density > 20,
    },
  ];

  return (
    <div className="mission-panel border-b-2 border-cyber-cyan/20">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
          {/* UTC Clock */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <div className="text-xs text-space-50 uppercase tracking-wider mb-1 font-mono">
              Mission Time
            </div>
            <div className="data-value text-lg font-mono tracking-tight">
              {formatUTC(time)}
            </div>
          </div>

          {/* Separator */}
          <div className="hidden lg:block w-px h-12 bg-cyber-cyan/20"></div>

          {/* Live Metrics */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative overflow-hidden rounded-lg p-3
                  ${metric.critical 
                    ? 'bg-cyber-red/10 border border-cyber-red/30 pulse-alert' 
                    : 'bg-space-300/30 border border-cyber-cyan/20'
                  }
                `}
              >
                {metric.critical && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-red animate-blink rounded-full m-1"></div>
                )}
                
                <div className="text-[10px] text-space-50 uppercase tracking-widest mb-1 font-mono">
                  {metric.label}
                </div>
                
                <div className="flex items-baseline space-x-1">
                  <span className={`
                    text-xl font-mono font-bold tracking-tight
                    ${metric.critical ? 'text-cyber-red' : 'text-cyber-cyan'}
                  `}>
                    {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                  </span>
                  <span className="text-xs text-space-50 font-mono">{metric.unit}</span>
                </div>
                
                <div className={`
                  text-[9px] uppercase font-mono font-bold tracking-wider mt-1
                  ${metric.critical 
                    ? 'text-cyber-red' 
                    : metric.status.includes('HIGH') || metric.status.includes('STORM')
                      ? 'text-cyber-amber'
                      : 'text-cyber-green'
                  }
                `}>
                  {metric.status}
                </div>

                {/* Animated scan line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDataTicker;
