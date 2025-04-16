import React, { useState, useEffect } from 'react';
import { Telescope, Star, Sparkles } from 'lucide-react';
import RedshiftCalculator from './components/RedshiftCalculator';
import SkyMap from './components/SkyMap';
import GalaxyDetails from './components/GalaxyDetails';
import axios from 'axios';

interface GalaxyDetailsInterface {
  object_id: string;
  ra: number | null;
  dec: number | null;
  g_mag: number | null;
  r_mag: number | null;
  i_mag: number | null;
  z_mag: number | null;
  y_mag: number | null;
  redshift: number | null;
  morphology: string | null;
}

interface CutoutImage {
  url: string;
  filter: string;
  error?: string;
}

function App() {
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyDetailsInterface | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [cutoutImages, setCutoutImages] = useState<CutoutImage[]>([]);
  const [isCutoutsLoading, setIsCutoutsLoading] = useState(false);
  const apiBaseUrl = 'http://localhost:5000';

  const handleGalaxySelect = async (details: GalaxyDetailsInterface | null, isLoading: boolean) => {
    setSelectedGalaxy(details);
    setIsDetailsLoading(isLoading);
    setCutoutImages([]); // Reset cutouts
    setIsCutoutsLoading(true); // Start cutout loading

    if (details && details.ra !== null && details.dec !== null && !isLoading) {
      // Fetch cutout images for all HSC bands
      const bands = ['HSC-G', 'HSC-R', 'HSC-I', 'HSC-Z', 'HSC-Y'];
      try {
        const response = await axios.post(`${apiBaseUrl}/api/fetchCutout`, {
          ra: details.ra,
          dec: details.dec,
          bands,
        });
        const cutouts: CutoutImage[] = response.data.cutouts.map((cutout: any) => ({
          url: cutout.image || '',
          filter: cutout.filter,
          error: cutout.error,
        }));
        setCutoutImages(cutouts);
      } catch (error) {
        console.error('Failed to fetch cutouts:', error);
        setCutoutImages(bands.map((filter) => ({ filter, url: '', error: 'Failed to load cutout' })));
      } finally {
        setIsCutoutsLoading(false); // End cutout loading
      }
    } else {
      setIsCutoutsLoading(false); // No cutouts to load
    }
  };

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
        <div className="flex flex-col gap-8">
          {/* Sky Map */}
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
              <SkyMap width={600} height={500} onGalaxySelect={handleGalaxySelect} />
            </div>
          </div>

          {/* Redshift Calculator and Galaxy Details */}
          <div className="relative flex flex-col md:flex-row gap-8">
            {/* Redshift Calculator */}
            <div className="max-w-md flex-1">
              <div className="glass-effect rounded-lg p-8 relative overflow-hidden">
                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-indigo-300 opacity-50" />
                <RedshiftCalculator
                  externalMagnitudes={
                    selectedGalaxy
                      ? {
                          g_mag: selectedGalaxy.g_mag,
                          r_mag: selectedGalaxy.r_mag,
                          i_mag: selectedGalaxy.i_mag,
                          z_mag: selectedGalaxy.z_mag,
                          y_mag: selectedGalaxy.y_mag,
                        }
                      : null
                  }
                  isDetailsLoading={isDetailsLoading}
                />
              </div>
            </div>

            {/* Galaxy Details */}
            <div className="max-w-3xl flex-1"> {/* Changed from max-w-md */}
              <div className="glass-effect rounded-lg p-8 relative overflow-hidden">
                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-indigo-300 opacity-50" />
                <GalaxyDetails
                  galaxy={selectedGalaxy}
                  cutoutImages={cutoutImages}
                  isLoading={isDetailsLoading}
                  isCutoutsLoading={isCutoutsLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;