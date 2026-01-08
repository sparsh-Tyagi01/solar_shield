import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/prediction', label: 'Storm Prediction' },
    { path: '/impact', label: 'Impact Analysis' },
    { path: '/history', label: 'Historical Data' },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SG</span>
            </div>
            <span className="text-white font-bold text-xl">SolarGuard 3D</span>
          </div>
          <div className="flex space-x-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
