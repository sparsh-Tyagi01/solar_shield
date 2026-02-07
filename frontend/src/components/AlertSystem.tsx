import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

interface AlertSystemProps {
  predictions?: any;
  currentData?: any;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ predictions, currentData }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Generate alerts based on conditions
    const newAlerts: Alert[] = [];

    if (currentData) {
      // Check for high solar wind
      if (currentData.speed > 700) {
        newAlerts.push({
          id: `speed-${Date.now()}`,
          type: 'critical',
          title: 'CRITICAL: Extreme Solar Wind',
          message: `Solar wind velocity at ${currentData.speed.toFixed(0)} km/s exceeds critical threshold`,
          timestamp: new Date(),
          dismissed: false,
        });
      } else if (currentData.speed > 500) {
        newAlerts.push({
          id: `speed-warning-${Date.now()}`,
          type: 'warning',
          title: 'WARNING: Elevated Solar Wind',
          message: `Solar wind velocity at ${currentData.speed.toFixed(0)} km/s - Monitor satellite status`,
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // Check for southward Bz
      if (currentData.bz < -15) {
        newAlerts.push({
          id: `bz-${Date.now()}`,
          type: 'critical',
          title: 'CRITICAL: Severe Southward IMF',
          message: `Bz component at ${currentData.bz.toFixed(1)} nT - High geomagnetic storm risk`,
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // Check Kp Index
      if (currentData.kp_index > 7) {
        newAlerts.push({
          id: `kp-${Date.now()}`,
          type: 'critical',
          title: 'STORM IN PROGRESS',
          message: `Kp index at ${currentData.kp_index.toFixed(0)} - Severe geomagnetic storm conditions`,
          timestamp: new Date(),
          dismissed: false,
        });
      }
    }

    if (predictions && predictions.probability > 0.7) {
      newAlerts.push({
        id: `prediction-${Date.now()}`,
        type: 'warning',
        title: 'High Storm Probability',
        message: `AI model predicts ${(predictions.probability * 100).toFixed(0)}% probability of geomagnetic storm`,
        timestamp: new Date(),
        dismissed: false,
      });
    }

    // Update alerts (avoid duplicates)
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const existing = prev.filter(a => !a.dismissed);
        const combined = [...newAlerts, ...existing];
        // Keep only last 10 alerts
        return combined.slice(0, 10);
      });
    }
  }, [currentData, predictions]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-cyber-red/10',
          border: 'border-cyber-red',
          text: 'text-cyber-red',
          icon: ExclamationTriangleIcon,
          pulse: true,
        };
      case 'warning':
        return {
          bg: 'bg-cyber-amber/10',
          border: 'border-cyber-amber',
          text: 'text-cyber-amber',
          icon: ExclamationTriangleIcon,
          pulse: false,
        };
      case 'info':
        return {
          bg: 'bg-cyber-blue/10',
          border: 'border-cyber-blue',
          text: 'text-cyber-blue',
          icon: InformationCircleIcon,
          pulse: false,
        };
      case 'success':
        return {
          bg: 'bg-cyber-green/10',
          border: 'border-cyber-green',
          text: 'text-cyber-green',
          icon: CheckCircleIcon,
          pulse: false,
        };
    }
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);

  return (
    <div className="fixed right-4 top-24 z-50 w-96 max-w-full">
      {/* Header */}
      <div 
        className="mission-panel p-3 cursor-pointer hover:border-cyber-cyan mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BoltIcon className="w-5 h-5 text-cyber-amber" />
            <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider">
              Alert System
            </h3>
            {activeAlerts.length > 0 && (
              <span className="px-2 py-0.5 bg-cyber-red rounded-full text-xs font-mono font-bold text-white animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4 text-space-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Alerts Container */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 max-h-[500px] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 217, 255, 0.3) rgba(10, 14, 39, 0.5)',
            }}
          >
            {activeAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mission-panel p-4 text-center"
              >
                <CheckCircleIcon className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                <p className="text-sm text-space-50 font-mono">All Systems Nominal</p>
                <p className="text-xs text-space-50/60 font-mono mt-1">No active alerts</p>
              </motion.div>
            ) : (
              activeAlerts.map((alert, index) => {
                const style = getAlertStyle(alert.type);
                const Icon = style.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      mission-panel p-3
                      ${style.bg}
                      border-l-4 ${style.border}
                      ${style.pulse ? 'pulse-alert' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5 ${style.pulse ? 'animate-blink' : ''}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-xs font-display font-bold ${style.text} uppercase tracking-wide`}>
                            {alert.title}
                          </h4>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-space-50 hover:text-white transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-space-50 mb-2 font-mono">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-space-50/60 font-mono">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          {alert.type === 'critical' && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyber-red bg-cyber-red/20 px-2 py-0.5 rounded">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertSystem;
