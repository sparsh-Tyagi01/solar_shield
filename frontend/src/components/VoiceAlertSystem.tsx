import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAlertSystemProps {
  kpIndex: number;
  imfBz: number;
  stormProbability: number;
  issRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

interface AlertHistory {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'danger' | 'critical';
}

interface AlertThresholds {
  kpWarning: number;
  kpDanger: number;
  bzThreshold: number;
  stormProbability: number;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const VoiceAlertSystem: React.FC<VoiceAlertSystemProps> = ({
  kpIndex,
  imfBz,
  stormProbability,
  issRiskLevel,
  className = ''
}) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('voiceAlerts_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('voiceAlerts_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    const saved = localStorage.getItem('voiceAlerts_thresholds');
    return saved !== null ? JSON.parse(saved) : {
      kpWarning: 5,
      kpDanger: 7,
      bzThreshold: -10,
      stormProbability: 80
    };
  });

  const lastAlertTimesRef = useRef<Record<string, number>>({});
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (voices.length > 0 && !selectedVoice) {
        // Prefer English voices
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        setSelectedVoice(englishVoice?.name || voices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('voiceAlerts_enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('voiceAlerts_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('voiceAlerts_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Check if alert is on cooldown
  const isOnCooldown = useCallback((alertType: string): boolean => {
    const lastTime = lastAlertTimesRef.current[alertType];
    if (!lastTime) return false;
    return Date.now() - lastTime < COOLDOWN_MS;
  }, []);

  // Speak alert message
  const speak = useCallback((message: string, alertType: string, severity: 'info' | 'warning' | 'danger' | 'critical') => {
    if (!isEnabled || isOnCooldown(alertType)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.volume = volume;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Set voice
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Update last alert time
    lastAlertTimesRef.current[alertType] = Date.now();

    // Add to history
    const newAlert: AlertHistory = {
      id: `${Date.now()}-${Math.random()}`,
      type: alertType,
      message,
      timestamp: new Date(),
      severity
    };
    setAlertHistory(prev => [newAlert, ...prev].slice(0, 20)); // Keep last 20
  }, [isEnabled, volume, selectedVoice, availableVoices, isOnCooldown]);

  // Monitor conditions and trigger alerts
  useEffect(() => {
    if (!isEnabled) return;

    // Kp Index Warnings
    if (kpIndex >= thresholds.kpDanger) {
      speak(
        `Critical space weather alert! Kp index has reached ${kpIndex.toFixed(1)}. Severe geomagnetic storm in progress. All satellite operations at high risk.`,
        'kp_danger',
        'critical'
      );
    } else if (kpIndex >= thresholds.kpWarning) {
      speak(
        `Warning: Elevated Kp index at ${kpIndex.toFixed(1)}. Moderate geomagnetic activity detected. Monitor satellite systems closely.`,
        'kp_warning',
        'warning'
      );
    }

    // IMF Bz Alert
    if (imfBz < thresholds.bzThreshold) {
      speak(
        `Alert: Interplanetary magnetic field Bz has dropped to ${imfBz.toFixed(1)} nanoTesla. Southward IMF orientation detected. Increased energy coupling with magnetosphere expected.`,
        'bz_alert',
        'danger'
      );
    }

    // Storm Probability Alert
    if (stormProbability >= thresholds.stormProbability) {
      speak(
        `High confidence storm prediction: ${stormProbability.toFixed(0)} percent probability of geomagnetic storm within 24 hours. Prepare satellite protection protocols.`,
        'storm_probability',
        'danger'
      );
    }

    // ISS Risk Alert
    if (issRiskLevel === 'critical' || issRiskLevel === 'high') {
      const level = issRiskLevel === 'critical' ? 'critical' : 'high';
      const action = issRiskLevel === 'critical' 
        ? 'Immediate crew safety protocols advised.' 
        : 'Enhanced radiation monitoring recommended.';
      speak(
        `International Space Station alert: ${level} radiation risk level detected. ${action}`,
        'iss_risk',
        issRiskLevel === 'critical' ? 'critical' : 'danger'
      );
    }
  }, [kpIndex, imfBz, stormProbability, issRiskLevel, isEnabled, thresholds, speak]);

  const testAlert = () => {
    const testMessage = `Voice alert system test. Current space weather: Kp index ${kpIndex.toFixed(1)}, IMF Bz ${imfBz.toFixed(1)} nanoTesla, storm probability ${stormProbability.toFixed(0)} percent. All systems operational.`;
    
    // Bypass cooldown for test
    lastAlertTimesRef.current['test'] = 0;
    speak(testMessage, 'test', 'info');
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const clearHistory = () => {
    if (window.confirm('Clear all alert history?')) {
      setAlertHistory([]);
    }
  };

  const getRemainingCooldown = (alertType: string): string => {
    const lastTime = lastAlertTimesRef.current[alertType];
    if (!lastTime) return '0s';
    
    const elapsed = Date.now() - lastTime;
    const remaining = Math.max(0, COOLDOWN_MS - elapsed);
    
    if (remaining === 0) return '0s';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'danger': return 'text-orange-500';
      case 'warning': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'danger': return '⚠️';
      case 'warning': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={className}>
      {/* Floating Control Button */}
      <motion.button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`fixed top-24 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 font-display font-bold text-white group relative ${
          isSpeaking 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 animate-pulse shadow-cyan-500/50' 
            : isEnabled
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/50'
            : 'bg-slate-700 hover:bg-slate-600 hover:shadow-slate-500/50'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Space Weather Alert System"
      >
        {isSpeaking ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="relative w-6 h-6"
          >
            {/* Animated sound waves */}
            <svg className="w-6 h-6 absolute inset-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9z" />
              <path d="M9 16v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
            </svg>
            {/* Pulsing rings */}
            <motion.div className="absolute inset-0 border-2 border-white rounded-full" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />
          </motion.div>
        ) : (
          <div className="relative w-6 h-6">
            {isEnabled ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                {/* Satellite icon */}
                <g>
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  {/* Solar panels */}
                  <rect x="3" y="10" width="3" height="4" fill="currentColor" opacity="0.8" />
                  <rect x="18" y="10" width="3" height="4" fill="currentColor" opacity="0.8" />
                  {/* Antenna */}
                  <line x1="12" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                  {/* Signal rings */}
                  <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                </g>
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" opacity="0.5">
                <g>
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  <rect x="3" y="10" width="3" height="4" fill="currentColor" opacity="0.5" />
                  <rect x="18" y="10" width="3" height="4" fill="currentColor" opacity="0.5" />
                  <line x1="12" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                  <circle cx="12" cy="2" r="1.5" fill="currentColor" opacity="0.5" />
                </g>
              </svg>
            )}
          </div>
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-75"></div>
        )}
        
        {/* Alert count badge */}
        {alertHistory.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {alertHistory.length > 9 ? '9+' : alertHistory.length}
          </span>
        )}
      </motion.button>

      {/* Settings & History Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-40 left-6 z-40 w-[450px] max-h-[calc(100vh-200px)] glass-effect rounded-2xl shadow-2xl shadow-cyan-500/10 border border-cyan-400/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-400/20 p-6 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                  <g>
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    <rect x="3" y="10" width="3" height="4" fill="currentColor" opacity="0.8" />
                    <rect x="18" y="10" width="3" height="4" fill="currentColor" opacity="0.8" />
                    <line x1="12" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                  </g>
                </svg>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Space Weather Alerts</h3>
                  <p className="text-xs text-cyan-300 font-mono uppercase tracking-widest">Real-time monitoring system</p>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 hover:bg-cyan-400/10 rounded-lg transition-colors text-cyan-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white font-display uppercase tracking-wider">Voice Alerts</label>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isEnabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ left: isEnabled ? '30px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {isEnabled ? '✓ Alerts will be spoken automatically' : '○ Voice alerts disabled'}
                </p>
              </div>

              {/* Volume Control */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm">
                <label className="text-sm font-semibold text-white mb-3 block font-display uppercase tracking-wider">
                  Volume: <span className="text-cyan-400">{Math.round(volume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Voice Selection */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm">
                <label className="text-sm font-semibold text-white mb-3 block font-display uppercase tracking-wider">Voice Selection</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Threshold Settings */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm space-y-3">
                <h4 className="text-sm font-semibold text-white mb-4 font-display uppercase tracking-wider">Alert Thresholds</h4>
                
                <div>
                  <label className="text-xs text-cyan-300 block mb-2 font-mono uppercase">Kp Warning Level</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={thresholds.kpWarning}
                    onChange={(e) => setThresholds({ ...thresholds, kpWarning: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-cyan-300 block mb-2 font-mono uppercase">Kp Danger Level</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={thresholds.kpDanger}
                    onChange={(e) => setThresholds({ ...thresholds, kpDanger: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-cyan-300 block mb-2 font-mono uppercase">IMF Bz Threshold (nT)</label>
                  <input
                    type="number"
                    min="-50"
                    max="0"
                    step="1"
                    value={thresholds.bzThreshold}
                    onChange={(e) => setThresholds({ ...thresholds, bzThreshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-cyan-300 block mb-2 font-mono uppercase">Storm Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={thresholds.stormProbability}
                    onChange={(e) => setThresholds({ ...thresholds, stormProbability: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>
              </div>

              {/* Test & Control Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={testAlert}
                  disabled={isSpeaking}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white text-sm font-display font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
                >
                  🎤 Test Alert
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-lg text-white text-sm font-display font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-red-500/50"
                  >
                    🛑 Stop
                  </button>
                )}
              </div>

              {/* Alert History */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Alert History</h4>
                  {alertHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {alertHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 font-mono">No alerts yet</p>
                  ) : (
                    alertHistory.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-800/30 rounded-lg p-3 border border-cyan-400/10"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-display font-semibold uppercase tracking-wider ${getSeverityColor(alert.severity)}`}>
                                {alert.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Cooldown Status */}
              <div className="glass-effect rounded-xl p-4 border border-cyan-400/20 backdrop-blur-sm">
                <h4 className="text-sm font-display font-semibold text-white mb-4 uppercase tracking-wider">Alert Cooldown</h4>
                <div className="space-y-2 text-xs font-mono">
                  {['kp_warning', 'kp_danger', 'bz_alert', 'storm_probability', 'iss_risk'].map(type => {
                    const cooldown = getRemainingCooldown(type);
                    const isActive = cooldown !== '0s';
                    return (
                      <div key={type} className="flex items-center justify-between px-2 py-1 rounded bg-slate-800/30 border border-cyan-400/10">
                        <span className="text-slate-400 uppercase">{type.replace(/_/g, ' ')}</span>
                        <span className={`font-mono ${isActive ? 'text-orange-500' : 'text-green-500'}`}>
                          {isActive ? `🔒 ${cooldown}` : '✅ Ready'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-4 font-mono italic">
                  Each alert type has a 5-minute cooldown to prevent notification spam
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAlertSystem;
