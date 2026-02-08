import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  SignalIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

interface SatelliteData {
  id: string;
  name: string;
  health: number;
  altitude: number;
  type: string;
  degradation: number;
  position?: { lat: number; lon: number };
}

interface SatelliteFleetGridProps {
  satellites: SatelliteData[];
  radiationLevel?: number;
}

const SatelliteFleetGrid: React.FC<SatelliteFleetGridProps> = ({ 
  satellites, 
  radiationLevel = 0 
}) => {
  const { t } = useTranslation();
  const getRiskStatus = (health: number, degradation: number) => {
    const riskScore = (100 - health) + degradation;
    
    if (riskScore > 60) {
      return {
        level: t('status.critical'),
        color: 'cyber-red',
        bg: 'bg-cyber-red/10',
        border: 'border-cyber-red',
        icon: ExclamationTriangleIcon,
        pulse: true,
      };
    } else if (riskScore > 40) {
      return {
        level: t('status.warning'),
        color: 'cyber-amber',
        bg: 'bg-cyber-amber/10',
        border: 'border-cyber-amber',
        icon: ExclamationTriangleIcon,
        pulse: false,
      };
    } else if (riskScore > 20) {
      return {
        level: t('status.medium'),
        color: 'cyber-amber-bright',
        bg: 'bg-cyber-amber-bright/10',
        border: 'border-cyber-amber-bright',
        icon: SignalIcon,
        pulse: false,
      };
    } else {
      return {
        level: t('status.operational'),
        color: 'cyber-green',
        bg: 'bg-cyber-green/10',
        border: 'border-cyber-green',
        icon: CheckCircleIcon,
        pulse: false,
      };
    }
  };

  const getTimeInDangerZone = (health: number) => {
    if (health > 80) return 'N/A';
    const mins = Math.floor((100 - health) * 2);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${mins}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-cyber-cyan uppercase tracking-wider">
          {t('nav.satellites')}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-xs text-space-50 uppercase tracking-wider font-mono">
            Assets Tracked: <span className="data-value">{satellites.length}</span>
          </div>
          <div className="text-xs text-space-50 uppercase tracking-wider font-mono">
            Radiation: <span className="data-value">{radiationLevel.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {satellites.map((sat, index) => {
          const status = getRiskStatus(sat.health, sat.degradation);
          const StatusIcon = status.icon;
          const dangerTime = getTimeInDangerZone(sat.health);

          return (
            <motion.div
              key={sat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`
                mission-panel p-4
                ${status.bg}
                border-l-2 ${status.border}
                ${status.pulse ? 'pulse-alert' : ''}
                hover-lift cursor-pointer
                relative overflow-hidden
              `}
            >
              {/* Animated scan line */}
              <div className="scan-line absolute top-0 left-0 right-0 h-full pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <StatusIcon className={`w-4 h-4 text-${status.color} ${status.pulse ? 'animate-blink' : ''}`} />
                    <span className="text-xs text-space-50 uppercase tracking-wider font-mono">
                      {sat.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-display font-bold text-white truncate">
                    {sat.name}
                  </h3>
                  <div className="text-[10px] text-space-50 font-mono uppercase tracking-wider mt-1">
                    ID: {sat.id}
                  </div>
                </div>
                <div className={`
                  px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider
                  bg-${status.color}/20 text-${status.color} border border-${status.color}/40
                `}>
                  {status.level}
                </div>
              </div>

              {/* Mini Globe Visualization */}
              <div className="mb-3 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  {/* Simple orbital visualization */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-cyan/20"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyber-blue/30 to-space-300/50"></div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-${status.color}`}
                         style={{ boxShadow: `0 0 10px currentColor` }}
                    ></div>
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SignalIcon className="w-4 h-4 text-cyber-cyan/50" />
                  </div>
                </div>
              </div>

              {/* Health Status */}
              <div className="space-y-2 mb-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-space-50 uppercase tracking-widest font-mono">
                      Health
                    </span>
                    <span className={`data-value text-xs`}>
                      {sat.health.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-space-300 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sat.health}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className={`h-full rounded-full ${
                        sat.health > 80 
                          ? 'bg-cyber-green' 
                          : sat.health > 60 
                            ? 'bg-cyber-amber' 
                            : 'bg-cyber-red'
                      }`}
                      style={{
                        boxShadow: sat.health < 60 ? '0 0 8px rgba(255, 68, 68, 0.6)' : 'none'
                      }}
                    ></motion.div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-space-50 uppercase tracking-widest font-mono">
                      Degradation
                    </span>
                    <span className={`text-xs font-mono ${
                      sat.degradation > 20 ? 'text-cyber-red' : 'text-space-50'
                    }`}>
                      {sat.degradation.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-space-300 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sat.degradation}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full rounded-full bg-cyber-red"
                      style={{
                        boxShadow: sat.degradation > 15 ? '0 0 8px rgba(255, 68, 68, 0.6)' : 'none'
                      }}
                    ></motion.div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-300/30 rounded p-2 border border-cyber-cyan/10">
                  <div className="text-[9px] text-space-50 uppercase tracking-widest font-mono mb-0.5">
                    Altitude
                  </div>
                  <div className="text-xs font-mono font-bold text-cyber-cyan">
                    {sat.altitude.toFixed(0)} km
                  </div>
                </div>
                <div className={`rounded p-2 border ${
                  dangerTime === 'N/A' ? 'bg-space-300/30 border-cyber-cyan/10' : 'bg-cyber-red/10 border-cyber-red/30'
                }`}>
                  <div className="text-[9px] text-space-50 uppercase tracking-widest font-mono mb-0.5">
                    Risk Zone
                  </div>
                  <div className={`text-xs font-mono font-bold ${
                    dangerTime === 'N/A' ? 'text-cyber-green' : 'text-cyber-red'
                  }`}>
                    {dangerTime}
                  </div>
                </div>
              </div>

              {/* Bottom indicator */}
              <div className={`mt-3 pt-1 border-t ${status.border}/20`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${status.color} animate-pulse`}></div>
                    <span className="text-[9px] text-space-50 uppercase tracking-widest font-mono">
                      Live Telemetry
                    </span>
                  </div>
                  <BoltIcon className="w-3 h-3 text-cyber-amber opacity-60" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SatelliteFleetGrid;
