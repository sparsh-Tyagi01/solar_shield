import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/3d-view', label: '3D Solar System' },
    { path: '/prediction', label: 'Storm Prediction' },
    { path: '/impact', label: 'Impact Analysis' },
    { path: '/history', label: 'Historical Data' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Shield className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="text-slate-900 font-bold text-xl">SolarShield</span>
          </Link>
          <div className="flex space-x-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-gray-100'
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
