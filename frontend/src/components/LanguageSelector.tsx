import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '简体中文' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' }
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug: Log languages array
  useEffect(() => {
    console.log('🌍 Available languages:', languages.map(l => l.name));
  }, []);
  const [showWelcome, setShowWelcome] = useState(false);

  // Auto-detect and show welcome popup on first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('languageWelcomeSeen');
    const savedLanguage = localStorage.getItem('language');
    
    if (!hasSeenWelcome && !savedLanguage) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang !== 'en' && ['hi', 'es', 'zh', 'ru'].includes(browserLang)) {
        setShowWelcome(true);
      }
    }
  }, []);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const acceptSuggestedLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    if (['hi', 'es', 'zh', 'ru'].includes(browserLang)) {
      changeLanguage(browserLang);
    }
    localStorage.setItem('languageWelcomeSeen', 'true');
    setShowWelcome(false);
  };

  const dismissWelcome = () => {
    localStorage.setItem('languageWelcomeSeen', 'true');
    setShowWelcome(false);
  };

  return (
    <>
      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-cyan-500/30 transition-all duration-200"
          aria-label="Select language"
        >
          <span className="text-2xl">{currentLanguage.flag}</span>
          <span className="text-sm font-semibold text-white uppercase">{currentLanguage.code}</span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {languages.map((lang) => {
                    console.log('🔍 Rendering language:', lang.name, lang.code);
                    return (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          lang.code === currentLanguage.code
                            ? 'bg-cyan-600 text-white'
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{lang.native}</div>
                          <div className="text-xs opacity-70">{lang.name}</div>
                        </div>
                        {lang.code === currentLanguage.code && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center"
              onClick={dismissWelcome}
            />

            {/* Popup */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            >
              <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Language Detected
                  </h3>
                  <p className="text-gray-300 text-sm">
                    We detected you might speak{' '}
                    <span className="font-bold text-cyan-400">
                      {languages.find(l => l.code === navigator.language.split('-')[0])?.native}
                    </span>
                  </p>
                </div>

                <p className="text-center text-gray-400 mb-6 text-sm">
                  Would you like to switch to your language?
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={dismissWelcome}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    No, keep English
                  </button>
                  <button
                    onClick={acceptSuggestedLanguage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Yes, switch
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LanguageSelector;
