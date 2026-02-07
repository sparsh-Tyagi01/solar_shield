import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  SignalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';
import SolarHeatmap from './SolarHeatmap';

interface HistoricalStorm {
  id: string;
  name: string;
  date: string;
  year: number;
  description: string;
  severity: number; // 1-10
  maxKp: number;
  maxSpeed: number;
  maxBz: number;
  historicalImpact: {
    satellitesAffected: number;
    powerOutages: string;
    communicationDisruptions: string;
    economicLoss: string;
  };
  imageUrl?: string;
}

interface CounterfactualAnalysis {
  satellitesAtRisk: number;
  totalSatellites: number;
  estimatedLoss: string;
  affectedRegions: string[];
  criticalInfrastructure: string[];
  recoveryTime: string;
  comparisonToHistorical: string;
}

const historicalStorms: HistoricalStorm[] = [
  {
    id: 'carrington-1859',
    name: 'Carrington Event',
    date: 'September 1-2, 1859',
    year: 1859,
    description: 'The most intense geomagnetic storm in recorded history. Telegraph systems across Europe and North America failed, with some operators receiving electric shocks.',
    severity: 10,
    maxKp: 9,
    maxSpeed: 2000,
    maxBz: -150,
    historicalImpact: {
      satellitesAffected: 0,
      powerOutages: 'Telegraph systems worldwide',
      communicationDisruptions: 'Complete telegraph failure for days',
      economicLoss: 'Estimated $10-15B in today\'s dollars'
    }
  },
  {
    id: 'halloween-2003',
    name: 'Halloween Storm',
    date: 'October 28-31, 2003',
    year: 2003,
    description: 'One of the largest solar storms in modern history. X-class flares caused satellite damage, airline route changes, and power grid issues.',
    severity: 9,
    maxKp: 9,
    maxSpeed: 2000,
    maxBz: -50,
    historicalImpact: {
      satellitesAffected: 47,
      powerOutages: 'Sweden (50,000 people)',
      communicationDisruptions: 'Aviation rerouted, GPS degraded',
      economicLoss: 'Estimated $1-2B globally'
    }
  },
  {
    id: 'quebec-1989',
    name: 'March 1989 Storm',
    date: 'March 13-14, 1989',
    year: 1989,
    description: 'Caused a catastrophic power failure in Quebec, leaving 6 million people without electricity for 9 hours.',
    severity: 8,
    maxKp: 9,
    maxSpeed: 1200,
    maxBz: -40,
    historicalImpact: {
      satellitesAffected: 12,
      powerOutages: '6M people in Quebec for 9 hours',
      communicationDisruptions: 'Radio blackouts globally',
      economicLoss: 'Over $500M in damages'
    }
  },
  {
    id: 'bastille-2000',
    name: 'Bastille Day Event',
    date: 'July 14-15, 2000',
    year: 2000,
    description: 'A powerful X5.7-class flare caused radio blackouts and auroras visible at mid-latitudes.',
    severity: 7,
    maxKp: 8,
    maxSpeed: 1800,
    maxBz: -35,
    historicalImpact: {
      satellitesAffected: 23,
      powerOutages: 'Minor grid fluctuations',
      communicationDisruptions: 'HF radio blackouts',
      economicLoss: 'Estimated $300M'
    }
  }
];

const SolarStormTimeMachine: React.FC = () => {
  const [selectedStorm, setSelectedStorm] = useState<HistoricalStorm | null>(null);
  const [showCounterfactual, setShowCounterfactual] = useState(false);
  const [counterfactual, setCounterfactual] = useState<CounterfactualAnalysis | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateCounterfactual = (storm: HistoricalStorm) => {
    setIsCalculating(true);
    setShowCounterfactual(false);
    
    // Simulate API call with realistic calculation
    setTimeout(() => {
      const currentSatellites = 8000; // Approximate current satellites in orbit
      const historicalSatellites = storm.year < 2000 ? 100 : storm.year < 2010 ? 800 : 1500;
      
      const riskPercentage = Math.min(95, (storm.severity / 10) * 100);
      const satellitesAtRisk = Math.floor(currentSatellites * (riskPercentage / 100));
      
      // Calculate economic loss based on severity and current infrastructure
      const baseMultiplier = currentSatellites / historicalSatellites;
      const economicMultiplier = storm.severity * baseMultiplier * 2;
      const estimatedLoss = `$${(economicMultiplier * 1.5).toFixed(1)}B - $${(economicMultiplier * 3).toFixed(1)}B`;
      
      const analysis: CounterfactualAnalysis = {
        satellitesAtRisk,
        totalSatellites: currentSatellites,
        estimatedLoss,
        affectedRegions: storm.severity > 8 
          ? ['North America', 'Europe', 'Asia', 'Australia', 'South America']
          : ['North America', 'Europe', 'Northern Asia'],
        criticalInfrastructure: [
          'GPS & Navigation Systems',
          'Telecommunications',
          'Power Grids',
          'Aviation Systems',
          'Financial Networks',
          'Internet Backbone',
          ...(storm.severity > 8 ? ['Emergency Services', 'Military Communications'] : [])
        ],
        recoveryTime: storm.severity > 8 
          ? '2-6 weeks' 
          : storm.severity > 6 
            ? '5-14 days' 
            : '2-7 days',
        comparisonToHistorical: `${(baseMultiplier * 100).toFixed(0)}% more satellites at risk compared to ${storm.year}`
      };
      
      setCounterfactual(analysis);
      setShowCounterfactual(true);
      setIsCalculating(false);
    }, 2000);
  };

  const handleStormSelect = (storm: HistoricalStorm) => {
    setSelectedStorm(storm);
    setShowCounterfactual(false);
    setCounterfactual(null);
  };

  const getSeverityColor = (severity: number): string => {
    if (severity >= 9) return 'text-red-500 bg-red-500/20 border-red-500';
    if (severity >= 7) return 'text-orange-500 bg-orange-500/20 border-orange-500';
    if (severity >= 5) return 'text-yellow-500 bg-yellow-500/20 border-yellow-500';
    return 'text-blue-500 bg-blue-500/20 border-blue-500';
  };

  const getSeverityLabel = (severity: number): string => {
    if (severity >= 9) return 'Extreme';
    if (severity >= 7) return 'Severe';
    if (severity >= 5) return 'Strong';
    return 'Moderate';
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <ClockIcon className="w-12 h-12 text-cyan-400 mr-3" />
            <h1 className="text-4xl font-display font-bold text-gradient">
              Solar Storm Time Machine
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Replay historic solar storms and discover what would happen if they struck Earth today
            with our current satellite infrastructure and technology dependence.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {historicalStorms.map((storm, index) => (
          <motion.div
            key={storm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleStormSelect(storm)}
            className={`
              glass-effect rounded-xl p-6 cursor-pointer hover-lift
              transition-all duration-300
              ${selectedStorm?.id === storm.id 
                ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/50' 
                : 'hover:ring-2 hover:ring-cyan-400/50'
              }
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-display font-semibold text-white mb-1">
                  {storm.name}
                </h3>
                <p className="text-sm text-slate-400">{storm.date}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(storm.severity)}`}>
                {getSeverityLabel(storm.severity)}
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 line-clamp-3">
              {storm.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-400 mb-1">Max Kp Index</div>
                <div className="text-white font-bold text-lg">{storm.maxKp}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-400 mb-1">Solar Wind</div>
                <div className="text-white font-bold text-lg">{storm.maxSpeed} km/s</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedStorm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-effect rounded-xl p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white">
                Historical Impact: {selectedStorm.name}
              </h2>
              <BoltIcon className="w-8 h-8 text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
                <SignalIcon className="w-6 h-6 text-red-400 mb-2" />
                <div className="text-sm text-slate-300 mb-1">Satellites Affected</div>
                <div className="text-2xl font-bold text-white">
                  {selectedStorm.historicalImpact.satellitesAffected}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30">
                <BoltIcon className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-sm text-slate-300 mb-1">Power Outages</div>
                <div className="text-sm font-semibold text-white">
                  {selectedStorm.historicalImpact.powerOutages}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                <GlobeAltIcon className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-sm text-slate-300 mb-1">Communications</div>
                <div className="text-sm font-semibold text-white">
                  {selectedStorm.historicalImpact.communicationDisruptions}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
                <ChartBarIcon className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm text-slate-300 mb-1">Economic Loss</div>
                <div className="text-sm font-semibold text-white">
                  {selectedStorm.historicalImpact.economicLoss}
                </div>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => calculateCounterfactual(selectedStorm)}
                disabled={isCalculating}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-display font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating Modern Impact...
                  </span>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
                    Calculate "What If This Hit Today?"
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showCounterfactual && counterfactual && selectedStorm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-effect rounded-xl p-8 mb-6 border-2 border-red-500/50">
              <div className="flex items-center mb-6">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mr-3 animate-pulse" />
                <div>
                  <h2 className="text-3xl font-display font-bold text-white">
                    Counterfactual Analysis: Today
                  </h2>
                  <p className="text-slate-300 mt-1">
                    If the {selectedStorm.name} struck Earth right now...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/50">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center">
                      <SignalIcon className="w-5 h-5 mr-2 text-red-400" />
                      Satellite Infrastructure Impact
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Satellites at Risk:</span>
                        <span className="text-2xl font-bold text-red-400">
                          {counterfactual.satellitesAtRisk.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Total in Orbit:</span>
                        <span className="text-lg font-semibold text-white">
                          {counterfactual.totalSatellites.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000 animate-pulse"
                          style={{ width: `${(counterfactual.satellitesAtRisk / counterfactual.totalSatellites) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {counterfactual.comparisonToHistorical}
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-900/30 rounded-lg p-6 border border-orange-500/50">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-orange-400" />
                      Economic Impact
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gradient mb-2">
                        {counterfactual.estimatedLoss}
                      </div>
                      <p className="text-sm text-slate-300">Estimated total losses globally</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500/50">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center">
                      <GlobeAltIcon className="w-5 h-5 mr-2 text-blue-400" />
                      Affected Regions
                    </h3>
                    <div className="space-y-2">
                      {counterfactual.affectedRegions.map((region, i) => (
                        <motion.div
                          key={region}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center bg-slate-800/50 rounded px-3 py-2"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                          <span className="text-slate-200">{region}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/50">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center">
                      <BoltIcon className="w-5 h-5 mr-2 text-purple-400" />
                      Critical Infrastructure
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {counterfactual.criticalInfrastructure.map((infra, i) => (
                        <motion.div
                          key={infra}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-slate-800/50 rounded px-2 py-2 text-xs text-slate-200 text-center"
                        >
                          {infra}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-500/30">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Recovery Time:</span>
                        <span className="text-lg font-bold text-purple-400">
                          {counterfactual.recoveryTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>⚠️ Important Note:</strong> This analysis uses current satellite infrastructure data
                  ({new Date().getFullYear()}) and applies the {selectedStorm.name}'s intensity parameters.
                  Actual impacts would depend on specific solar conditions, Earth's magnetic field orientation,
                  and real-time mitigation efforts.
                </p>
              </div>
            </div>

            {/* Add the heatmap showing the storm impact pattern */}
            <SolarHeatmap 
              title={`${selectedStorm.name} - Impact Intensity Map`}
              colorScheme="radiation"
              showLegend={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SolarStormTimeMachine;
