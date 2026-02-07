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
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

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
  const isOnCooldown = (alertType: string): boolean => {
    const lastTime = lastAlertTimesRef.current[alertType];
    if (!lastTime) return false;
    return Date.now() - lastTime < COOLDOWN_MS;
  };

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
  }, [isEnabled, volume, selectedVoice, availableVoices]);

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
      case 'warning': return 'text-yellow-500';
      default: return 'text-cyan-500';
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
        className={`fixed top-24 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isSpeaking 
            ? 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse' 
            : isEnabled
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-pink-500/50'
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Voice Alert System"
      >
        {isSpeaking ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            🔊
          </motion.div>
        ) : (
          <span className="text-2xl">{isEnabled ? '🔔' : '🔕'}</span>
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-75"></div>
        )}
        
        {/* Alert count badge */}
        {alertHistory.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
            className="fixed top-40 left-6 z-40 w-[450px] max-h-[calc(100vh-200px)] bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🔔</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Voice Alert System</h3>
                  <p className="text-xs text-purple-100">Automated space weather notifications</p>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white">Voice Alerts</label>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isEnabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ left: isEnabled ? '30px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {isEnabled ? 'Alerts will be spoken automatically' : 'Voice alerts disabled'}
                </p>
              </div>

              {/* Volume Control */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                <label className="text-sm font-semibold text-white mb-2 block">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Voice Selection */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                <label className="text-sm font-semibold text-white mb-2 block">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Threshold Settings */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20 space-y-3">
                <h4 className="text-sm font-semibold text-white mb-3">Alert Thresholds</h4>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Kp Warning Level</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={thresholds.kpWarning}
                    onChange={(e) => setThresholds({ ...thresholds, kpWarning: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Kp Danger Level</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={thresholds.kpDanger}
                    onChange={(e) => setThresholds({ ...thresholds, kpDanger: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">IMF Bz Threshold (nT)</label>
                  <input
                    type="number"
                    min="-50"
                    max="0"
                    step="1"
                    value={thresholds.bzThreshold}
                    onChange={(e) => setThresholds({ ...thresholds, bzThreshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Storm Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={thresholds.stormProbability}
                    onChange={(e) => setThresholds({ ...thresholds, stormProbability: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Test & Control Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={testAlert}
                  disabled={isSpeaking}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎤 Test Alert
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors"
                  >
                    🛑 Stop
                  </button>
                )}
              </div>

              {/* Alert History */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">Alert History</h4>
                  {alertHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {alertHistory.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No alerts yet</p>
                  ) : (
                    alertHistory.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold uppercase ${getSeverityColor(alert.severity)}`}>
                                {alert.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Cooldown Status */}
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                <h4 className="text-sm font-semibold text-white mb-3">Cooldown Status</h4>
                <div className="space-y-2 text-xs">
                  {['kp_warning', 'kp_danger', 'bz_alert', 'storm_probability', 'iss_risk'].map(type => {
                    const cooldown = getRemainingCooldown(type);
                    const isActive = cooldown !== '0s';
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-400">{type.replace(/_/g, ' ')}</span>
                        <span className={`font-mono ${isActive ? 'text-orange-500' : 'text-green-500'}`}>
                          {isActive ? `🔒 ${cooldown}` : '✅ Ready'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Each alert type has a 5-minute cooldown to prevent spam
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
