import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Satellite, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Zap,
  TrendingUp,
  Database,
  MapPin,
  Clock
} from 'lucide-react';

const Landing: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Video */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/10925862-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="max-w-6xl mx-auto text-center px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <Shield className="relative w-24 h-24 text-cyan-400 drop-shadow-2xl" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-8xl font-display font-bold mb-6"
            >
              <span className="text-gradient">Solar</span>
              <span className="text-white">Shield</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-body"
            >
              Advanced Space Weather Intelligence & Satellite Protection with AI-Powered Predictions
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-display font-semibold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all"
                >
                  Launch Dashboard
                </motion.button>
              </Link>
              
              <Link to="/time-machine">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass-effect text-white rounded-xl font-display font-semibold text-lg shadow-2xl border border-cyan-400/50 hover:border-cyan-400 transition-all flex items-center space-x-2 animate-pulse-slow"
                >
                  <Clock className="w-5 h-5" />
                  <span>Time Machine</span>
                </motion.button>
              </Link>
              
              <a href="#features">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-display font-semibold text-lg shadow-2xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Learn More
                </motion.button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-display font-bold text-gradient text-center mb-4"
          >
            Key Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-slate-300 mb-16 text-lg font-body"
          >
            Powered by cutting-edge AI and real-time space weather data
          </motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="w-8 h-8" />}
              title="Solar Storm Time Machine"
              description="Replay historic solar storms and see what would happen if they hit Earth TODAY with our current satellite infrastructure."
            />
            <FeatureCard 
              icon={<Activity className="w-8 h-8" />}
              title="Real-Time Monitoring"
              description="Continuous tracking of solar activity, including solar wind speed, proton density, and magnetic field strength."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Storm Prediction"
              description="Advanced machine learning models predict solar storm occurrence and severity up to 72 hours in advance."
            />
            <FeatureCard 
              icon={<AlertTriangle className="w-8 h-8" />}
              title="Impact Analysis"
              description="Real-time assessment of potential impacts on satellite operations, power grids, and communication systems."
            />
            <FeatureCard 
              icon={<Satellite className="w-8 h-8" />}
              title="Satellite Fleet Monitoring"
              description="Track and monitor satellite health, orbital parameters, and vulnerability to solar events."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8" />}
              title="3D Earth Visualization"
              description="Interactive 3D globe showing affected regions, radiation levels, and real-time coverage areas."
            />
          </div>
        </div>
      </section>

      {/* Terminology Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">
            Key Terms & Concepts
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Understanding space weather terminology</p>
          <div className="grid md:grid-cols-2 gap-6">
            <TermCard 
              term="Solar Storm"
              definition="A disturbance in Earth's magnetosphere caused by solar wind, resulting from solar flares or coronal mass ejections (CMEs)."
            />
            <TermCard 
              term="Solar Wind"
              definition="A stream of charged particles released from the upper atmosphere of the Sun, traveling at speeds of 400-800 km/s."
            />
            <TermCard 
              term="Proton Density"
              definition="The number of protons per cubic centimeter in the solar wind, typically ranging from 5-15 particles/cm³."
            />
            <TermCard 
              term="Kp Index"
              definition="A global geomagnetic activity index ranging from 0-9, indicating the disturbance level of Earth's magnetic field."
            />
            <TermCard 
              term="Dst Index"
              definition="Disturbance Storm Time index measuring the strength of the ring current around Earth, indicating geomagnetic storm intensity."
            />
            <TermCard 
              term="Coronal Mass Ejection (CME)"
              definition="A large release of plasma and magnetic field from the solar corona, capable of causing major geomagnetic storms."
            />
            <TermCard 
              term="Magnetosphere"
              definition="The region around Earth controlled by its magnetic field, providing protection from solar wind and cosmic radiation."
            />
            <TermCard 
              term="Geomagnetic Storm"
              definition="A temporary disturbance of Earth's magnetosphere caused by solar wind, classified into G1-G5 levels based on severity."
            />
            <TermCard 
              term="Satellite Anomaly"
              definition="Unexpected behavior or malfunction in satellite systems, often caused by radiation from solar storms."
            />
            <TermCard 
              term="Solar Flare"
              definition="A sudden flash of increased brightness on the Sun, releasing energy equivalent to millions of nuclear bombs."
            />
            <TermCard 
              term="Radiation Belt"
              definition="Zones of energetic charged particles trapped by Earth's magnetic field, including the Van Allen belts."
            />
            <TermCard 
              term="Space Weather"
              definition="Environmental conditions in space influenced by solar activity, affecting technological systems and human activities."
            />
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">
            Data Sources & Metrics
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Real-time data from trusted sources</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MetricCard 
              icon={<Database className="w-6 h-6" />}
              title="NOAA SWPC"
              description="Real-time solar wind data and space weather alerts from the National Oceanic and Atmospheric Administration."
            />
            <MetricCard 
              icon={<Satellite className="w-6 h-6" />}
              title="DSCOVR Satellite"
              description="Deep Space Climate Observatory providing real-time solar wind measurements at the L1 Lagrange point."
            />
            <MetricCard 
              icon={<Activity className="w-6 h-6" />}
              title="ACE Satellite"
              description="Advanced Composition Explorer measuring solar wind composition and magnetic field data."
            />
            <MetricCard 
              icon={<Zap className="w-6 h-6" />}
              title="Solar Flux"
              description="Measurement of radio emissions from the Sun at 10.7 cm wavelength, indicating solar activity levels."
            />
            <MetricCard 
              icon={<MapPin className="w-6 h-6" />}
              title="Geomagnetic Indices"
              description="Kp, Dst, and Ap indices measuring the strength and impact of geomagnetic disturbances."
            />
            <MetricCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="ML Predictions"
              description="Machine learning models trained on historical data to predict storm occurrence and severity."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[#081a44]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Monitor Solar Activity?
          </h2>
          <p className="text-xl mb-8 text-blue-50">
            Get real-time insights and predictions for solar storms and their impact on satellite infrastructure.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
          >
            Launch Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-white font-semibold">SolarShield</span>
          </div>
          <p className="text-gray-400">&copy; 2026 SolarShield. Advanced Solar Storm Monitoring System.</p>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, highlight = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`
        glass-effect rounded-xl p-6 hover-lift cursor-pointer
        ${highlight 
          ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-400 animate-pulse-slow' 
          : 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600'
        }
      `}
    >
      <div className={`mb-4 ${highlight ? 'text-cyan-400' : 'text-blue-400'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300 font-body">{description}</p>
      {highlight && (
        <div className="mt-4">
          <span className="inline-block px-3 py-1 bg-cyan-400 text-slate-900 rounded-full text-xs font-bold">
            NEW FEATURE
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Term Card Component
interface TermCardProps {
  term: string;
  definition: string;
}

const TermCard: React.FC<TermCardProps> = ({ term, definition }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{term}</h3>
      <p className="text-gray-600">{definition}</p>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default Landing;
