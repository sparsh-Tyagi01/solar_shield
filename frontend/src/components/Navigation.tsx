import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/solid';

const Navigation: React.FC = () => {
  const location = useLocation();

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/3d-view', label: '3D Solar System' },
    { path: '/time-machine', label: 'Time Machine', highlight: true },
    { path: '/prediction', label: 'Prediction',},
    { path: '/impact', label: 'Impact',  },
    { path: '/history', label: 'History', },
  ];

  return (
    <nav className="glass-effect border-b border-white/10 shadow-2xl sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-full">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-white font-display font-bold text-2xl tracking-tight">
                Solar<span className="text-gradient">Shield</span>
              </span>
              <div className="text-xs text-slate-400 font-medium">Space Weather Intelligence</div>
            </div>
          </Link>
          
          <div className="flex space-x-2">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-4 py-2.5 rounded-lg transition-all duration-300 font-display font-medium text-sm
                    flex items-center space-x-2 relative overflow-hidden group
                    ${location.pathname === link.path
                      ? link.highlight
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }
                    ${link.highlight && location.pathname !== link.path ? 'border border-cyan-400/50 animate-pulse-slow' : ''}
                  `}
                >
                  {link.highlight && location.pathname !== link.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 shimmer"></div>
                  )}
                  
                  <span className="relative z-10">{link.label}</span>
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
