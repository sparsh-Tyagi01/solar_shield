import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  Satellite, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Zap,
  TrendingUp,
  Database,
  MapPin,
  Play,
  Sparkles
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
    <div className="min-h-screen bg-white">
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
            className="w-full h-full object-cover"
          >
            <source src="/10925862-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="max-w-6xl mx-auto text-center px-6">
            <div className="flex justify-center mb-6">
              <Shield className="w-20 h-20 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              SolarShield
            </h1>
            <p className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto drop-shadow-lg">
              Advanced Solar Storm Prediction and Satellite Protection System
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
              >
                Launch Dashboard
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">
            Key Features
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Powered by cutting-edge technology and real-time data</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <FeatureCard 
              icon={<Sun className="w-8 h-8" />}
              title="Solar System 3D View"
              description="Immersive 3D visualization of the solar system with real-time solar wind propagation."
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
      <section className="px-6 py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Monitor Solar Activity?
          </h2>
          <p className="text-xl mb-8 text-blue-50">
            Get real-time insights and predictions for solar storms and their impact on satellite infrastructure.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
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
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
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
