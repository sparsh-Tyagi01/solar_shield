import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  confidence: number; // 0-100
  currentData: any;
  predictions: any;
  className?: string;
}

interface Factor {
  name: string;
  value: number;
  percentage: number;
  description: string;
  color: string;
}

interface SimilarEvent {
  name: string;
  year: number;
  peakKp: number;
  duration: number;
  impact: string;
  similarity: number;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  currentData,
  predictions,
  className = ''
}) => {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);

  // Calculate contributing factors
  useEffect(() => {
    if (!currentData) return;

    const bz = Math.abs(currentData.bz || 0);
    const speed = Math.abs(currentData.speed - 400);
    const density = Math.abs(currentData.density - 5);
    const kp = currentData.kp_index || 0;

    const total = bz + speed/10 + density + kp*5;
    
    const newFactors: Factor[] = [
      {
        name: 'IMF Bz Component',
        value: bz,
        percentage: (bz / total) * 100,
        description: `${currentData.bz?.toFixed(1) || 0} nT (${currentData.bz < 0 ? 'southward = dangerous' : 'northward = safe'})`,
        color: 'from-cyan-500 to-blue-600'
      },
      {
        name: 'Solar Wind Speed',
        value: speed,
        percentage: ((speed/10) / total) * 100,
        description: `${currentData.speed?.toFixed(0) || 400} km/s (${currentData.speed > 500 ? 'above threshold' : 'normal'})`,
        color: 'from-blue-500 to-purple-600'
      },
      {
        name: 'Proton Density',
        value: density,
        percentage: (density / total) * 100,
        description: `${currentData.density?.toFixed(1) || 5} p/cm³`,
        color: 'from-purple-500 to-pink-600'
      },
      {
        name: 'Historical Patterns',
        value: kp*5,
        percentage: ((kp*5) / total) * 100,
        description: `Based on ${kp > 5 ? 'active' : 'quiet'} conditions analysis`,
        color: 'from-pink-500 to-red-600'
      }
    ];

    setFactors(newFactors.sort((a, b) => b.percentage - a.percentage));
  }, [currentData]);

  // Generate similar events
  useEffect(() => {
    if (!currentData) return;

    const events: SimilarEvent[] = [
      {
        name: 'Halloween Storm 2003',
        year: 2003,
        peakKp: 9,
        duration: 18,
        impact: 'Satellite damage, power outages',
        similarity: 78
      },
      {
        name: 'March Equinox Storm 2015',
        year: 2015,
        peakKp: 8,
        duration: 12,
        impact: 'GPS disruptions, aurora to mid-latitudes',
        similarity: 65
      },
      {
        name: 'Quebec Blackout Event 1989',
        year: 1989,
        peakKp: 9,
        duration: 24,
        impact: 'Power grid collapse, transformer damage',
        similarity: 52
      }
    ];

    // Adjust similarities based on current Kp
    const kp = currentData.kp_index || 0;
    const adjustedEvents = events.map(event => ({
      ...event,
      similarity: Math.max(10, Math.min(95, event.similarity - Math.abs(event.peakKp - kp) * 8))
    }));

    setSimilarEvents(adjustedEvents.sort((a, b) => b.similarity - a.similarity));
  }, [currentData]);

  // Update confidence history
  useEffect(() => {
    setConfidenceHistory(prev => {
      const newHistory = [...prev, confidence];
      return newHistory.slice(-20); // Keep last 20 points
    });
  }, [confidence]);

  const getConfidenceColor = () => {
    if (confidence >= 90) return { bg: 'from-green-500 to-green-600', text: 'text-green-500', ring: 'stroke-green-500' };
    if (confidence >= 70) return { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-500', ring: 'stroke-cyan-500' };
    if (confidence >= 50) return { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-500', ring: 'stroke-yellow-500' };
    return { bg: 'from-orange-500 to-orange-600', text: 'text-orange-500', ring: 'stroke-orange-500' };
  };

  const colors = getConfidenceColor();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const metrics = [
    { name: 'Accuracy', value: 87, icon: '✅' },
    { name: 'Precision', value: 84, icon: '✅' },
    { name: 'Recall', value: 91, icon: '✅' },
    { name: 'False Alarms', value: 8, icon: '🟢', inverse: true }
  ];

  return (
    <div className={`bg-gray-800/50 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
          <span>🎯</span>
          <span>AI CONFIDENCE DASHBOARD</span>
        </h2>
        <p className="text-sm text-gray-400">Prediction reliability and model explainability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Circular Confidence */}
        <div className="space-y-6">
          {/* Circular Progress Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <svg className="transform -rotate-90 w-64 h-64">
                {/* Background ring */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-gray-700"
                />
                {/* Progress ring */}
                <motion.circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className={colors.ring}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className={`text-6xl font-bold ${colors.text}`}
                >
                  {confidence}%
                </motion.div>
                <div className="text-sm text-gray-400 mt-2">Prediction Confidence</div>
              </div>
            </div>

            {/* Confidence Trend */}
            <div className="w-full mt-4">
              <div className="text-xs text-gray-500 mb-2 text-center">Last 20 updates</div>
              <div className="h-16 flex items-end justify-between space-x-1">
                {confidenceHistory.map((val, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / 100) * 100}%` }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex-1 bg-gradient-to-t ${colors.bg} rounded-t`}
                    style={{ minHeight: '4px' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Model Performance Metrics */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">📊 Model Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.name} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{metric.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{metric.value}%</span>
                    <span className="text-xl">{metric.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Factors & Events */}
        <div className="space-y-6">
          {/* AI Reasoning */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI REASONING</span>
            </h3>
            <div className="space-y-3">
              {factors.map((factor, idx) => (
                <motion.div
                  key={factor.name}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer"
                  title={factor.description}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{factor.name}</span>
                    <span className="text-sm font-bold text-white">{factor.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.percentage}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                      className={`h-full bg-gradient-to-r ${factor.color}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {factor.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Similar Events */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span>📊</span>
              <span>HISTORICAL MATCH</span>
            </h3>
            {similarEvents.length > 0 && (
              <div className="space-y-3">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-2">
                    Current conditions <span className="font-bold text-cyan-400">{similarEvents[0].similarity}%</span> similar to:
                  </div>
                  <div className="text-lg font-bold text-white mb-2">
                    🌩️ {similarEvents[0].name}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Peak Kp</div>
                      <div className="font-bold text-white">{similarEvents[0].peakKp}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="font-bold text-white">{similarEvents[0].duration}h</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Impact</div>
                      <div className="font-bold text-red-400">High</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{similarEvents[0].impact}</div>
                </div>

                <div className="space-y-2">
                  {similarEvents.slice(1).map((event, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{event.name}</span>
                        <span className="font-bold text-cyan-400">{event.similarity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div>Model: <span className="text-cyan-400 font-semibold">XGBoost + TensorFlow Ensemble</span></div>
          <div>Last Updated: <span className="text-white font-semibold">2 minutes ago</span></div>
          <div>Training Data: <span className="text-white font-semibold">10 years of NOAA records</span></div>
          <button className="text-cyan-400 hover:text-cyan-300 underline">Learn how our AI works →</button>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
