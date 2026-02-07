import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

interface ThreatLevelBannerProps {
  predictions: any;
  severity?: number;
  nextUpdateIn?: number;
}

const ThreatLevelBanner: React.FC<ThreatLevelBannerProps> = ({ 
  predictions, 
  severity = 0,
  nextUpdateIn = 300 
}) => {
  const [countdown, setCountdown] = useState(nextUpdateIn);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : nextUpdateIn));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextUpdateIn]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine threat level
  const getThreatLevel = () => {
    const prob = predictions?.probability || predictions?.storm_probability || 0;
    const sev = severity || 0;
    
    if (sev > 7 || prob > 0.7) {
      return {
        level: 'CRITICAL',
        code: 'RED',
        color: 'cyber-red',
        bgGradient: 'from-cyber-red/20 to-cyber-red-orange/20',
        borderColor: 'border-cyber-red',
        icon: BoltIcon,
        message: 'SEVERE GEOMAGNETIC STORM IMMINENT',
        action: 'IMMEDIATE ACTION REQUIRED',
      };
    } else if (sev > 5 || prob > 0.5) {
      return {
        level: 'WARNING',
        code: 'ORANGE',
        color: 'cyber-amber',
        bgGradient: 'from-cyber-amber/20 to-solar-600/20',
        borderColor: 'border-cyber-amber',
        icon: ExclamationTriangleIcon,
        message: 'MODERATE STORM CONDITIONS EXPECTED',
        action: 'MONITOR SATELLITE STATUS',
      };
    } else if (sev > 3 || prob > 0.3) {
      return {
        level: 'WATCH',
        code: 'YELLOW',
        color: 'cyber-amber-bright',
        bgGradient: 'from-cyber-amber-bright/20 to-cyber-amber/20',
        borderColor: 'border-cyber-amber-bright',
        icon: ShieldExclamationIcon,
        message: 'MINOR STORM ACTIVITY POSSIBLE',
        action: 'MAINTAIN VIGILANCE',
      };
    } else {
      return {
        level: 'NOMINAL',
        code: 'GREEN',
        color: 'cyber-green',
        bgGradient: 'from-cyber-green/20 to-aurora-600/20',
        borderColor: 'border-cyber-green',
        icon: ShieldCheckIcon,
        message: 'ALL SYSTEMS NOMINAL',
        action: 'ROUTINE MONITORING',
      };
    }
  };

  const threat = getThreatLevel();
  const Icon = threat.icon;
  const probability = (predictions?.probability || predictions?.storm_probability || 0) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        mission-panel mb-6
        bg-gradient-to-r ${threat.bgGradient}
        border-l-4 ${threat.borderColor}
        ${threat.code === 'RED' ? 'pulse-alert' : ''}
      `}
    >
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Threat Level Indicator */}
          <div className="lg:col-span-2 flex items-center space-x-3">
            <motion.div
              animate={{ 
                scale: threat.code === 'RED' ? [1, 1.1, 1] : 1,
                rotate: threat.code === 'RED' ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                repeat: threat.code === 'RED' ? Infinity : 0,
                duration: 1 
              }}
            >
              <Icon className={`w-10 h-10 text-${threat.color}`} />
            </motion.div>
            <div>
              <div className={`text-xs uppercase tracking-widest text-${threat.color} font-mono font-bold`}>
                THREAT LEVEL
              </div>
              <div className={`text-2xl font-display font-black text-${threat.color} tracking-tight`}>
                {threat.code}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="lg:col-span-4 lg:border-l lg:border-r border-space-50/20 lg:px-4">
            <div className="text-sm text-space-50 uppercase tracking-wider font-mono mb-1">
              Status
            </div>
            <div className="text-lg font-display font-bold text-white">
              {threat.message}
            </div>
            <div className={`text-xs text-${threat.color} font-mono uppercase tracking-wide mt-1`}>
              › {threat.action}
            </div>
          </div>

          {/* Metrics */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <div className="bg-space-300/30 rounded-lg p-3 border border-cyber-cyan/20">
              <div className="text-[10px] text-space-50 uppercase tracking-widest font-mono mb-1">
                Storm Probability
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="data-value text-2xl">
                  {probability.toFixed(1)}
                </span>
                <span className="text-xs text-space-50 font-mono">%</span>
              </div>
              <div className="w-full bg-space-300 rounded-full h-1 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${probability}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-1 rounded-full bg-gradient-to-r from-${threat.color} to-${threat.color}-bright`}
                  style={{
                    boxShadow: `0 0 10px rgba(${threat.code === 'RED' ? '255, 68, 68' : threat.code === 'ORANGE' ? '255, 176, 32' : '0, 255, 136'}, 0.5)`
                  }}
                ></motion.div>
              </div>
            </div>

            <div className="bg-space-300/30 rounded-lg p-3 border border-cyber-cyan/20">
              <div className="text-[10px] text-space-50 uppercase tracking-widest font-mono mb-1">
                Severity Index
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="data-value text-2xl">
                  {severity.toFixed(1)}
                </span>
                <span className="text-xs text-space-50 font-mono">/10</span>
              </div>
              <div className="w-full bg-space-300 rounded-full h-1 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(severity / 10) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-1 rounded-full bg-gradient-to-r from-${threat.color} to-${threat.color}-bright`}
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="lg:col-span-2 text-center lg:text-right">
            <div className="text-[10px] text-space-50 uppercase tracking-widest font-mono mb-1">
              Next Update
            </div>
            <div className="data-value text-3xl font-mono tabular-nums">
              {formatCountdown(countdown)}
            </div>
            <div className="text-[9px] text-space-50 uppercase font-mono tracking-wider mt-1">
              MM:SS
            </div>
          </div>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="relative h-1 overflow-hidden">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-${threat.color} to-transparent`}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
        ></motion.div>
      </div>
    </motion.div>
  );
};

export default ThreatLevelBanner;
