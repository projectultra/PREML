import React from 'react';
import { Telescope, Star, Sparkles } from 'lucide-react';
import RedshiftCalculator from './components/RedshiftCalculator';
import SkyMap from './components/SkyMap';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="star-field" />
      
      {/* Nebula effects */}
      <div className="nebula-glow bg-purple-500" style={{ top: '10%', left: '5%' }} />
      <div className="nebula-glow bg-blue-500" style={{ top: '60%', right: '10%' }} />
      
      {/* Header */}
      <header className="relative bg-transparent py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-opacity-20 bg-indigo-900 p-3 rounded-lg glass-effect">
            <Telescope className="w-8 h-8 text-indigo-300" />
            <Star className="w-6 h-6 text-indigo-400 animate-pulse" />
            <h1 className="text-3xl font-bold text-white">Cosmic Calculator</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Calculator */}
          <div className="relative">
            <div className="glass-effect rounded-lg p-8 relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-indigo-300 opacity-50" />
              <RedshiftCalculator />
            </div>
          </div>

          {/* Right Column - Sky Map */}
          <div className="relative">
            <div className="glass-effect rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-indigo-300" />
                Interactive Sky Map
              </h2>
              <p className="text-indigo-200 mb-4">
                Explore the real cosmos with Gaia DR2 data and PanSTARRS imagery. 
                Navigate through actual astronomical data and discover the universe 
                in stunning detail.
              </p>
              <SkyMap width={600} height={500} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;