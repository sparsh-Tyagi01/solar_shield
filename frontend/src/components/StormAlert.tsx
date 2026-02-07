import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ShieldCheckIcon, CheckBadgeIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  level: string;
  probability: number;
  severity?: number;
  confidence?: number;
}

interface EconomyLoss {
  total_expected_loss_million_usd: number;
  satellite_damage: {
    expected_loss_million_usd: number;
    satellites_at_risk: number;
    damage_probability: number;
  };
  service_disruption: {
    expected_loss_million_usd: number;
    duration_hours: number;
  };
  recommendation: string;
  net_benefit_of_action_million_usd: number;
}

const StormAlert: React.FC<AlertProps> = ({ level, probability, severity = 0, confidence = 85 }) => {
  const [economyLoss, setEconomyLoss] = useState<EconomyLoss | null>(null);
  const [showEconomyDetails, setShowEconomyDetails] = useState(false);

  // Fetch economy loss when severity is significant
  useEffect(() => {
    if (severity > 3) {
      fetch('http://localhost:8000/api/economy-loss/current')
        .then(res => res.json())
        .then(data => setEconomyLoss(data))
        .catch(err => console.error('Error fetching economy loss:', err));
    }
  }, [severity]);

  const alertConfig = {
    critical: {
      gradient: 'from-red-500/30 to-red-600/30',
      border: 'border-red-500/70',
      text: 'text-red-300',
      glowColor: 'shadow-red-500/50',
      icon: ExclamationTriangleIcon,
      message: 'CRITICAL: Major geomagnetic storm imminent',
    },
    warning: {
      gradient: 'from-orange-500/30 to-orange-600/30',
      border: 'border-orange-500/70',
      text: 'text-orange-300',
      glowColor: 'shadow-orange-500/50',
      icon: ExclamationTriangleIcon,
      message: 'WARNING: Moderate storm conditions expected',
    },
    watch: {
      gradient: 'from-yellow-500/30 to-yellow-600/30',
      border: 'border-yellow-500/70',
      text: 'text-yellow-300',
      glowColor: 'shadow-yellow-500/50',
      icon: ExclamationTriangleIcon,
      message: 'WATCH: Minor storm activity possible',
    },
    normal: {
      gradient: 'from-aurora-500/30 to-aurora-600/30',
      border: 'border-aurora-500/70',
      text: 'text-aurora-300',
      glowColor: 'shadow-aurora-500/50',
      icon: ShieldCheckIcon,
      message: 'All systems normal - No storm activity',
    },
  };

  const config = alertConfig[level as keyof typeof alertConfig] || alertConfig.normal;
  const Icon = config.icon;

  // Determine confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-aurora-400';
    if (conf >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 90) return 'Excellent';
    if (conf >= 80) return 'Very Good';
    if (conf >= 70) return 'Good';
    if (conf >= 60) return 'Moderate';
    return 'Low';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`
        glass-effect rounded-xl p-6 mb-6 
        bg-gradient-to-br ${config.gradient}
        border-2 ${config.border}
        shadow-xl ${config.glowColor}
        hover-lift
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ 
              scale: level === 'critical' ? [1, 1.2, 1] : 1,
              rotate: level === 'critical' ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              repeat: level === 'critical' ? Infinity : 0,
              duration: 1 
            }}
          >
            <Icon className={`w-10 h-10 ${config.text} drop-shadow-lg`} />
          </motion.div>
          <div>
            <h3 className={`text-2xl font-display font-bold ${config.text} drop-shadow`}>
              {config.message}
            </h3>
            <div className="flex items-center space-x-6 mt-3">
              <div className="glass-effect px-3 py-1.5 rounded-lg">
                <p className="text-slate-200 text-sm">
                  Storm Probability: <span className="font-bold text-white">{(probability * 100).toFixed(1)}%</span>
                </p>
              </div>
              {severity > 0 && (
                <div className="glass-effect px-3 py-1.5 rounded-lg">
                  <p className="text-slate-200 text-sm">
                    Severity: <span className="font-bold text-white">{severity.toFixed(2)}</span>
                  </p>
                </div>
              )}
              {/* NEW: Confidence Score Display */}
              <div className="glass-effect px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <CheckBadgeIcon className={`w-5 h-5 ${getConfidenceColor(confidence)}`} />
                <p className={`${getConfidenceColor(confidence)} font-semibold text-sm`}>
                  {confidence.toFixed(0)}% ({getConfidenceLabel(confidence)})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Economy Loss Display */}
      {economyLoss && severity > 3 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
              <h4 className="text-lg font-bold text-slate-800">
                Potential Economic Impact (IF Alert Ignored)
              </h4>
            </div>
            <button
              onClick={() => setShowEconomyDetails(!showEconomyDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showEconomyDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-slate-600 uppercase">Total Expected Loss</p>
              <p className="text-2xl font-bold text-red-600">
                ${economyLoss.total_expected_loss_million_usd.toFixed(1)}M
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-slate-600 uppercase">Satellite Damage Risk</p>
              <p className="text-2xl font-bold text-orange-600">
                ${economyLoss.satellite_damage.expected_loss_million_usd.toFixed(1)}M
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {economyLoss.satellite_damage.satellites_at_risk} satellites at risk
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-slate-600 uppercase">Net Benefit of Action</p>
              <p className="text-2xl font-bold text-green-600">
                ${economyLoss.net_benefit_of_action_million_usd.toFixed(1)}M
              </p>
            </div>
          </div>

          {showEconomyDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-white/60 rounded-lg p-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-slate-800 mb-2">Service Disruption</h5>
                  <p className="text-sm text-slate-700">
                    Expected Duration: <span className="font-semibold">{economyLoss.service_disruption.duration_hours.toFixed(1)} hours</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Cost: <span className="font-semibold text-orange-600">${economyLoss.service_disruption.expected_loss_million_usd.toFixed(1)}M</span>
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 mb-2">Damage Assessment</h5>
                  <p className="text-sm text-slate-700">
                    Damage Probability: <span className="font-semibold">{economyLoss.satellite_damage.damage_probability.toFixed(0)}%</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">
                  💡 Recommendation: {economyLoss.recommendation}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StormAlert;
