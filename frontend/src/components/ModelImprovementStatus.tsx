import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, ArrowTrendingUpIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { API } from '../config/api';

interface ModelPerformance {
  storm_occurrence: {
    current_accuracy?: number;
    baseline: number;
    status: string;
  };
  storm_severity: {
    current_mae?: number;
    current_rmse?: number;
    baseline_mae: number;
    status: string;
  };
  impact_risk: {
    current_accuracy?: number;
    baseline: number;
    status: string;
  };
}

interface ImprovementTracking {
  storm_occurrence: {
    predictions_logged: number;
    outcomes_recorded: number;
    recent_performance?: number;
  };
  storm_severity: {
    predictions_logged: number;
    outcomes_recorded: number;
    recent_performance?: number;
  };
  impact_risk: {
    predictions_logged: number;
    outcomes_recorded: number;
    recent_performance?: number;
  };
}

const ModelImprovementStatus: React.FC = () => {
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [improvement, setImprovement] = useState<ImprovementTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelStatus();
    const interval = setInterval(fetchModelStatus, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchModelStatus = async () => {
    try {
      const [perfRes, impRes] = await Promise.all([
        fetch(API.confidenceSummary),
        fetch(API.modelImprovementStatus)
      ]);

      const perfData = await perfRes.json();
      const impData = await impRes.json();

      setPerformance(perfData);
      setImprovement(impData.improvement_tracking);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching model status:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = getStatusColor(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-6 shadow-md border border-blue-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-7 h-7 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">
            Model Performance & Auto-Improvement
          </h3>
        </div>
        <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
      </div>

      {performance && performance.storm_occurrence && performance.storm_severity && performance.impact_risk ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Storm Occurrence Model */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Storm Occurrence</h4>
              {getStatusBadge(performance.storm_occurrence.status)}
            </div>
            <div className="space-y-2">
              {performance.storm_occurrence.current_accuracy !== undefined && 
               performance.storm_occurrence.current_accuracy !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-semibold text-green-600">
                    {(performance.storm_occurrence.current_accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Baseline:</span>
                <span className="font-medium text-slate-700">
                  {((performance.storm_occurrence.baseline || 0.85) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Storm Severity Model */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Storm Severity</h4>
              {getStatusBadge(performance.storm_severity.status)}
            </div>
            <div className="space-y-2">
              {performance.storm_severity.current_mae !== undefined && 
               performance.storm_severity.current_mae !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">MAE:</span>
                  <span className="font-semibold text-blue-600">
                    {performance.storm_severity.current_mae.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Baseline MAE:</span>
                <span className="font-medium text-slate-700">
                  {performance.storm_severity.baseline_mae?.toFixed(2) || '1.20'}
                </span>
              </div>
            </div>
          </div>

          {/* Impact Risk Model */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Impact Risk</h4>
              {getStatusBadge(performance.impact_risk.status)}
            </div>
            <div className="space-y-2">
              {performance.impact_risk.current_accuracy !== undefined && 
               performance.impact_risk.current_accuracy !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-semibold text-green-600">
                    {(performance.impact_risk.current_accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Baseline:</span>
                <span className="font-medium text-slate-700">
                  {((performance.impact_risk.baseline || 0.80) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-slate-600">
          No performance data available yet. Models will display metrics once predictions are made.
        </div>
      )}

      {/* Model Improvement Tracking */}
      {improvement && (
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-slate-800">Auto-Improvement Tracking</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(improvement).map(([model, data]) => (
              <div key={model} className="text-center">
                <p className="text-xs text-slate-600 mb-1 capitalize">
                  {model.replace('_', ' ')}
                </p>
                <p className="text-sm">
                  <span className="font-bold text-blue-600">{data.outcomes_recorded}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="font-medium text-slate-600">{data.predictions_logged}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">outcomes recorded</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-slate-600 text-center">
              💡 Models automatically improve as actual outcomes are recorded and compared with predictions
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ModelImprovementStatus;
