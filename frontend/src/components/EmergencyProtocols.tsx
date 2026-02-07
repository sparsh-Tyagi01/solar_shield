import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

interface ProtocolItem {
  id: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  timeLimit?: number; // seconds
  category: string;
}

interface Protocol {
  id: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extreme';
  title: string;
  description: string;
  items: ProtocolItem[];
  generatedAt: Date;
}

interface EmergencyProtocolsProps {
  kpIndex: number;
  stormProbability: number;
  imfBz: number;
  satelliteHealth: number;
  className?: string;
}

const EmergencyProtocols: React.FC<EmergencyProtocolsProps> = ({
  kpIndex,
  stormProbability,
  imfBz,
  satelliteHealth,
  className = ''
}) => {
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate protocol based on conditions
  const generateProtocol = (): Protocol => {
    const severity = calculateSeverity();
    const items: ProtocolItem[] = [];

    // Base protocol items for all severity levels
    items.push({
      id: 'monitor-1',
      action: 'Monitor space weather dashboard continuously',
      priority: 'high',
      completed: false,
      category: 'Monitoring'
    });

    // Severity-specific protocols
    if (severity === 'Low') {
      items.push(
        {
          id: 'check-1',
          action: 'Perform routine satellite health checks',
          priority: 'medium',
          completed: false,
          category: 'Satellite Operations'
        },
        {
          id: 'log-1',
          action: 'Log current space weather conditions',
          priority: 'low',
          completed: false,
          category: 'Documentation'
        }
      );
    }

    if (severity === 'Moderate' || severity === 'High' || severity === 'Severe' || severity === 'Extreme') {
      items.push(
        {
          id: 'alert-1',
          action: 'Notify satellite operations team of elevated conditions',
          priority: 'high',
          completed: false,
          timeLimit: 900, // 15 minutes
          category: 'Communications'
        },
        {
          id: 'sat-1',
          action: 'Review satellite orbital parameters and exposure',
          priority: 'high',
          completed: false,
          category: 'Satellite Operations'
        },
        {
          id: 'backup-1',
          action: 'Verify backup systems are operational',
          priority: 'medium',
          completed: false,
          category: 'System Preparedness'
        }
      );
    }

    if (severity === 'High' || severity === 'Severe' || severity === 'Extreme') {
      items.push(
        {
          id: 'power-1',
          action: 'Reduce non-essential satellite power consumption',
          priority: 'critical',
          completed: false,
          timeLimit: 600, // 10 minutes
          category: 'Satellite Operations'
        },
        {
          id: 'orient-1',
          action: 'Orient solar panels to minimize radiation exposure',
          priority: 'critical',
          completed: false,
          timeLimit: 1200, // 20 minutes
          category: 'Satellite Operations'
        },
        {
          id: 'crew-1',
          action: 'Alert ISS crew and recommend shelter in shielded areas',
          priority: 'critical',
          completed: false,
          timeLimit: 300, // 5 minutes
          category: 'Crew Safety'
        },
        {
          id: 'ground-1',
          action: 'Notify ground station operators of potential disruptions',
          priority: 'high',
          completed: false,
          category: 'Communications'
        },
        {
          id: 'data-1',
          action: 'Enable enhanced telemetry data recording',
          priority: 'medium',
          completed: false,
          category: 'Data Management'
        }
      );
    }

    if (severity === 'Severe' || severity === 'Extreme') {
      items.push(
        {
          id: 'mode-1',
          action: 'Switch critical satellites to safe mode',
          priority: 'critical',
          completed: false,
          timeLimit: 300, // 5 minutes
          category: 'Satellite Operations'
        },
        {
          id: 'power-2',
          action: 'Shutdown non-critical satellite subsystems',
          priority: 'critical',
          completed: false,
          timeLimit: 600, // 10 minutes
          category: 'Satellite Operations'
        },
        {
          id: 'evac-1',
          action: 'Consider ISS evacuation protocols if radiation exceeds limits',
          priority: 'critical',
          completed: false,
          timeLimit: 300, // 5 minutes
          category: 'Crew Safety'
        },
        {
          id: 'coord-1',
          action: 'Coordinate with international space agencies',
          priority: 'high',
          completed: false,
          category: 'Coordination'
        },
        {
          id: 'media-1',
          action: 'Prepare public communications and status updates',
          priority: 'medium',
          completed: false,
          category: 'Communications'
        }
      );
    }

    if (severity === 'Extreme') {
      items.push(
        {
          id: 'emergency-1',
          action: 'EMERGENCY: Activate highest level space weather protocols',
          priority: 'critical',
          completed: false,
          timeLimit: 180, // 3 minutes
          category: 'Emergency Response'
        },
        {
          id: 'grid-1',
          action: 'Alert power grid operators of potential impacts',
          priority: 'critical',
          completed: false,
          timeLimit: 600, // 10 minutes
          category: 'Critical Infrastructure'
        },
        {
          id: 'aviation-1',
          action: 'Issue warnings to aviation authorities for polar routes',
          priority: 'high',
          completed: false,
          category: 'Aviation Safety'
        },
        {
          id: 'continuous-1',
          action: 'Establish 24/7 monitoring and response team',
          priority: 'critical',
          completed: false,
          category: 'Emergency Response'
        }
      );
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      id: `protocol-${Date.now()}`,
      severity,
      title: `${severity} Risk Protocol`,
      description: getProtocolDescription(severity, kpIndex, stormProbability, imfBz),
      items,
      generatedAt: new Date()
    };
  };

  const calculateSeverity = (): Protocol['severity'] => {
    let score = 0;

    // Kp index contribution (0-40 points)
    if (kpIndex >= 9) score += 40;
    else if (kpIndex >= 7) score += 30;
    else if (kpIndex >= 5) score += 20;
    else if (kpIndex >= 4) score += 10;

    // Storm probability contribution (0-30 points)
    if (stormProbability >= 0.9) score += 30;
    else if (stormProbability >= 0.7) score += 20;
    else if (stormProbability >= 0.5) score += 10;

    // IMF Bz contribution (0-20 points)
    if (imfBz <= -20) score += 20;
    else if (imfBz <= -10) score += 15;
    else if (imfBz <= -5) score += 10;

    // Satellite health contribution (0-10 points)
    if (satelliteHealth < 50) score += 10;
    else if (satelliteHealth < 70) score += 5;

    // Determine severity based on total score
    if (score >= 70) return 'Extreme';
    if (score >= 50) return 'Severe';
    if (score >= 30) return 'High';
    if (score >= 15) return 'Moderate';
    return 'Low';
  };

  const getProtocolDescription = (severity: string, kp: number, prob: number, bz: number): string => {
    const descriptions = {
      Low: `Routine monitoring advised. Current Kp: ${kp.toFixed(1)}, Storm Probability: ${(prob * 100).toFixed(0)}%`,
      Moderate: `Elevated space weather activity detected. Enhanced monitoring recommended. Kp: ${kp.toFixed(1)}, IMF Bz: ${bz.toFixed(1)} nT`,
      High: `Significant geomagnetic activity. Implement protective measures for sensitive operations. Storm probability: ${(prob * 100).toFixed(0)}%`,
      Severe: `Severe space weather conditions. Critical satellite operations at risk. Immediate action required. Kp: ${kp.toFixed(1)}`,
      Extreme: `EXTREME GEOMAGNETIC STORM. All systems at maximum risk. Execute emergency protocols immediately. Multiple factors critical.`
    };
    return descriptions[severity as keyof typeof descriptions];
  };

  // Initialize and update protocol
  useEffect(() => {
    const newProtocol = generateProtocol();
    setCurrentProtocol(newProtocol);

    // Initialize timers for items with time limits
    const initialTimers: Record<string, number> = {};
    newProtocol.items.forEach(item => {
      if (item.timeLimit) {
        initialTimers[item.id] = item.timeLimit;
      }
    });
    setTimeRemaining(initialTimers);
  }, [kpIndex, stormProbability, imfBz, satelliteHealth]);

  // Timer countdown
  useEffect(() => {
    if (!currentProtocol) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const item = currentProtocol.items.find(i => i.id === key);
          if (item && !item.completed && updated[key] > 0) {
            updated[key] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentProtocol]);

  const toggleItemCompletion = (itemId: string) => {
    if (!currentProtocol) return;
    
    setCurrentProtocol({
      ...currentProtocol,
      items: currentProtocol.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    });
  };

  const getProgress = (): number => {
    if (!currentProtocol || currentProtocol.items.length === 0) return 0;
    const completed = currentProtocol.items.filter(i => i.completed).length;
    return (completed / currentProtocol.items.length) * 100;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'from-red-600 to-red-800';
      case 'Severe': return 'from-orange-600 to-red-600';
      case 'High': return 'from-yellow-600 to-orange-600';
      case 'Moderate': return 'from-blue-600 to-yellow-600';
      default: return 'from-green-600 to-blue-600';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'border-red-500';
      case 'Severe': return 'border-orange-500';
      case 'High': return 'border-yellow-500';
      case 'Moderate': return 'border-blue-500';
      default: return 'border-green-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  const exportToPDF = () => {
    if (!currentProtocol) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('EMERGENCY SPACE WEATHER PROTOCOL', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Metadata
    doc.setFontSize(12);
    doc.text(`Severity: ${currentProtocol.severity}`, margin, y);
    y += 7;
    doc.text(`Generated: ${currentProtocol.generatedAt.toLocaleString()}`, margin, y);
    y += 7;
    doc.text(`Progress: ${getProgress().toFixed(0)}%`, margin, y);
    y += 10;

    // Description
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(currentProtocol.description, pageWidth - 2 * margin);
    doc.text(splitDescription, margin, y);
    y += splitDescription.length * 5 + 10;

    // Protocol items
    doc.setFontSize(14);
    doc.text('ACTION ITEMS:', margin, y);
    y += 10;

    doc.setFontSize(10);
    currentProtocol.items.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const status = item.completed ? '[COMPLETED]' : '[PENDING]';
      const priority = `Priority: ${item.priority.toUpperCase()}`;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${status}`, margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      const splitAction = doc.splitTextToSize(item.action, pageWidth - 2 * margin - 10);
      doc.text(splitAction, margin + 5, y);
      y += splitAction.length * 5;
      
      doc.setFontSize(8);
      doc.text(`${priority} | Category: ${item.category}`, margin + 5, y);
      y += 7;
      
      if (item.timeLimit) {
        doc.text(`Time Limit: ${Math.floor(item.timeLimit / 60)} minutes`, margin + 5, y);
        y += 5;
      }
      
      y += 5;
      doc.setFontSize(10);
    });

    // Footer
    doc.setFontSize(8);
    doc.text('SolarGuard 3D - Space Weather Monitoring System', pageWidth / 2, 285, { align: 'center' });

    doc.save(`emergency-protocol-${currentProtocol.severity}-${Date.now()}.pdf`);
  };

  const exportToJSON = () => {
    if (!currentProtocol) return;

    const data = {
      ...currentProtocol,
      generatedAt: currentProtocol.generatedAt.toISOString(),
      progress: getProgress(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-protocol-${currentProtocol.severity}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetProtocol = () => {
    if (window.confirm('Reset all protocol items to incomplete?')) {
      if (currentProtocol) {
        setCurrentProtocol({
          ...currentProtocol,
          items: currentProtocol.items.map(item => ({ ...item, completed: false }))
        });
      }
    }
  };

  if (!currentProtocol) return null;

  return (
    <div className={className}>
      {/* Floating Status Button */}
      <motion.button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`fixed bottom-24 left-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 bg-gradient-to-r ${getSeverityColor(currentProtocol.severity)} text-white font-bold transition-all duration-300 hover:scale-105`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Emergency Protocols"
      >
        <span className="text-2xl">⚡</span>
        <div>
          <div className="text-sm uppercase tracking-wider">{currentProtocol.severity} Risk</div>
          <div className="text-xs opacity-90">{getProgress().toFixed(0)}% Complete</div>
        </div>
      </motion.button>

      {/* Protocol Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 400 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-40 left-6 z-40 w-[550px] max-h-[calc(100vh-220px)] bg-gray-900 rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col"
            style={{ borderColor: getSeverityBorderColor(currentProtocol.severity).replace('border-', '') }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getSeverityColor(currentProtocol.severity)} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">⚡</span>
                  <div>
                    <h3 className="font-bold text-white text-xl">{currentProtocol.title}</h3>
                    <p className="text-xs text-white/90">Generated: {currentProtocol.generatedAt.toLocaleTimeString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="bg-black/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-white/90"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-white/80 mt-2">{getProgress().toFixed(0)}% of protocol actions completed</p>
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <p className="text-sm text-gray-200">{currentProtocol.description}</p>
            </div>

            {/* Action Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentProtocol.items.map((item, index) => {
                const timeLeft = timeRemaining[item.id];
                const isUrgent = timeLeft !== undefined && timeLeft < 60 && !item.completed;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                      item.completed ? 'border-green-500/50 opacity-60' : 
                      isUrgent ? 'border-red-500 animate-pulse' :
                      item.priority === 'critical' ? 'border-red-500/50' :
                      'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItemCompletion(item.id)}
                        className={`mt-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          item.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {item.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPriorityIcon(item.priority)}</span>
                            <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                              item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          
                          {/* Timer */}
                          {timeLeft !== undefined && !item.completed && (
                            <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${
                              timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' :
                              timeLeft < 300 ? 'bg-orange-500 text-white' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              ⏱️ {formatTime(timeLeft)}
                            </div>
                          )}
                        </div>

                        <p className={`text-sm mb-2 ${item.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {item.action}
                        </p>

                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>📁 {item.category}</span>
                          {item.completed && <span className="text-green-500">✓ Completed</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={exportToJSON}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export JSON</span>
                </button>
              </div>
              <button
                onClick={resetProtocol}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                🔄 Reset Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyProtocols;
