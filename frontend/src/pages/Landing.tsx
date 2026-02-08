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
      <section className="relative min-h-screen overflow-hidden pt-20 pb-20">
        {/* Background Video with Enhanced Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-35"
          >
            <source src="/10925862-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto text-center px-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur"
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-cyan-300">Next Generation Space Weather AI</span>
            </motion.div>
            
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                <Shield className="relative w-20 h-20 text-cyan-400 drop-shadow-2xl" />
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
            >
              <span className="text-gradient">Protect Your</span>
              <br />
              <span className="text-white">Satellite Infrastructure</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-body leading-relaxed"
            >
              AI-powered space weather intelligence with 72-hour solar storm predictions and real-time satellite monitoring
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            >
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-display font-semibold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all whitespace-nowrap"
                >
                  Launch Dashboard
                </motion.button>
              </Link>
              
              <a href="#features">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass-effect text-white rounded-full font-display font-semibold text-lg border border-cyan-400/50 hover:border-cyan-400 transition-all"
                >
                  Learn More
                </motion.button>
              </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-700/50"
            >
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">72h</div>
                <div className="text-sm text-slate-400 font-body">Prediction Window</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
                <div className="text-sm text-slate-400 font-body">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">Real-time</div>
                <div className="text-sm text-slate-400 font-body">Data Updates</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Enterprise-Grade</span> Features
            </h2>
            <p className="text-xl text-slate-400 font-body max-w-2xl mx-auto">
              Everything you need to protect your satellite infrastructure from solar storms
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* How It Works Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-slate-400 font-body max-w-2xl mx-auto">
              Three simple steps to monitor and predict solar storms
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard 
              number="01"
              title="Real-Time Data Collection"
              description="Continuously fetch and process solar activity data from NOAA, DSCOVR, and other trusted space weather sources."
            />
            <StepCard 
              number="02"
              title="AI Analysis & Prediction"
              description="Advanced machine learning models analyze patterns to predict solar storms up to 72 hours in advance."
            />
            <StepCard 
              number="03"
              title="Actionable Insights"
              description="Get real-time alerts, impact assessments, and satellite vulnerability analysis in one dashboard."
            />
          </div>
        </div>
      </section>
      <section className="px-6 py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-gradient mb-6">
              Key Concepts Explained
            </h2>
            <p className="text-xl text-slate-400 font-body">Understanding space weather terminology</p>
          </motion.div>
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
      <section className="px-6 py-24 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-gradient mb-6">
              Data Sources & Metrics
            </h2>
            <p className="text-xl text-slate-400 font-body">Real-time data from trusted sources</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="relative px-6 py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20 -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-display font-bold mb-6"
          >
            Ready to Protect Your <span className="text-gradient">Satellites</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.1 }}
            className="text-xl text-slate-300 mb-12 font-body"
          >
            Get real-time insights and predictions for solar storms and their impact on satellite infrastructure.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link 
              to="/dashboard" 
              className="inline-block"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-display font-semibold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all"
              >
                Launch Dashboard Now
              </motion.button>
            </Link>
            <a href="#features" className="inline-block">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 glass-effect text-white rounded-full font-display font-semibold text-lg border border-cyan-400/50 hover:border-cyan-400 transition-all"
              >
                Explore Features
              </motion.button>
            </a>
          </motion.div>
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
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -8 }}
      className="group glass-effect rounded-2xl p-8 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden"
    >
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      
      {/* Icon Container */}
      <div className="mb-6 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-blue-600/40 transition-all duration-300">
        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-slate-400 font-body leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>

      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
    </motion.div>
  );
};

// Step Card Component
interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="glass-effect rounded-2xl p-8 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 relative group"
    >
      {/* Step Number */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
        {number}
      </div>

      <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-slate-400 font-body leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-effect rounded-xl p-6 border border-slate-700 hover:border-cyan-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <h3 className="text-lg font-bold text-cyan-400 mb-3 group-hover:text-cyan-300 transition-colors">{term}</h3>
      <p className="text-slate-400 font-body group-hover:text-slate-300 transition-colors">{definition}</p>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-effect rounded-xl p-6 border border-slate-700 hover:border-cyan-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="text-cyan-400 mb-3 group-hover:text-cyan-300 transition-colors">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{description}</p>
    </motion.div>
  );
};

export default Landing;
