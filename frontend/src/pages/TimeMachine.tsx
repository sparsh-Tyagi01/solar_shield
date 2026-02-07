import React from 'react';
import { motion } from 'framer-motion';
import SolarStormTimeMachine from '../components/SolarStormTimeMachine';

const TimeMachine: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <SolarStormTimeMachine />
      </div>
    </motion.div>
  );
};

export default TimeMachine;
