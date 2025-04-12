import React, { useState } from 'react';
import { Calculator, Star, Image, ToggleLeft, Sparkles } from 'lucide-react';

interface MagnitudeValues {
  u: number;
  g: number;
  r: number;
  i: number;
  z: number;
}

const RedshiftCalculator: React.FC = () => {
  const [isPhotometric, setIsPhotometric] = useState(true);
  const [magnitudes, setMagnitudes] = useState<MagnitudeValues>({
    u: 22.1,
    g: 20.8,
    r: 19.5,
    i: 19.2,
    z: 18.9
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [calculatedRedshift, setCalculatedRedshift] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatePhotometricRedshift = () => {
    setIsCalculating(true);
    // Simulate calculation with random value between 0.1 and 3.0
    const randomRedshift = (Math.random() * 2.9 + 0.1).toFixed(3);
    setTimeout(() => {
      setCalculatedRedshift(Number(randomRedshift));
      setIsCalculating(false);
    }, 800); // Add slight delay for effect
  };

  const calculateImageRedshift = () => {
    if (!selectedImage) return;
    setIsCalculating(true);
    // Simulate calculation with random value between 0.2 and 4.0
    const randomRedshift = (Math.random() * 3.8 + 0.2).toFixed(3);
    setTimeout(() => {
      setCalculatedRedshift(Number(randomRedshift));
      setIsCalculating(false);
    }, 1200); // Longer delay for image processing simulation
  };

  const handleInputChange = (filter: keyof MagnitudeValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMagnitudes(prev => ({
      ...prev,
      [filter]: parseFloat(e.target.value) || 0
    }));
    setCalculatedRedshift(null); // Reset result when input changes
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCalculatedRedshift(null); // Reset result when new image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeSwitch = () => {
    setIsPhotometric(!isPhotometric);
    setCalculatedRedshift(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-indigo-300" />
          <h2 className="text-2xl font-bold text-white">Redshift Calculator</h2>
        </div>
        <button
          onClick={handleModeSwitch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ToggleLeft className="w-5 h-5" />
          <span>{isPhotometric ? 'Switch to Image' : 'Switch to Photometric'}</span>
        </button>
      </div>

      {isPhotometric ? (
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(magnitudes).map(([filter, value]) => (
            <div key={filter} className="flex flex-col">
              <label className="text-sm font-medium text-indigo-200 mb-1 flex items-center gap-2">
                <Star className="w-4 h-4" />
                {filter.toUpperCase()} Magnitude
              </label>
              <input
                type="number"
                value={value}
                onChange={handleInputChange(filter as keyof MagnitudeValues)}
                step="0.1"
                className="input-space px-3 py-2 rounded-md focus:outline-none"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-indigo-200 mb-1 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Upload Spectral Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-space px-3 py-2 rounded-md focus:outline-none"
            />
          </div>
          
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Spectral preview"
                className="w-full h-48 object-cover rounded-lg border border-indigo-500/20"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <button
          onClick={isPhotometric ? calculatePhotometricRedshift : calculateImageRedshift}
          disabled={isCalculating || (!isPhotometric && !selectedImage)}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            isCalculating || (!isPhotometric && !selectedImage)
              ? 'bg-indigo-800 opacity-50 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculating...' : 'Calculate Redshift'}
        </button>

        <div className="p-4 bg-indigo-900 bg-opacity-30 rounded-lg border border-indigo-500/20">
          <p className="text-lg font-semibold text-indigo-200">
            Estimated Redshift:{' '}
            <span className="text-white">
              {calculatedRedshift !== null 
                ? calculatedRedshift 
                : isPhotometric 
                  ? 'Click calculate to determine redshift'
                  : selectedImage 
                    ? 'Click calculate to determine redshift'
                    : 'Upload an image to calculate'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedshiftCalculator;