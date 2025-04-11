import React, { useState } from 'react';
import { Calculator, Star } from 'lucide-react';

interface MagnitudeValues {
  u: number;
  g: number;
  r: number;
  i: number;
  z: number;
}

const RedshiftCalculator: React.FC = () => {
  const [magnitudes, setMagnitudes] = useState<MagnitudeValues>({
    u: 22.1,
    g: 20.8,
    r: 19.5,
    i: 19.2,
    z: 18.9
  });

  const calculateRedshift = (values: MagnitudeValues): number => {
    // This is a simplified mock calculation
    // In reality, redshift calculation would involve more complex algorithms
    const colorIndex = (values.g - values.r) + (values.r - values.i);
    return Number((colorIndex * 0.5).toFixed(3));
  };

  const handleInputChange = (filter: keyof MagnitudeValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMagnitudes(prev => ({
      ...prev,
      [filter]: parseFloat(e.target.value) || 0
    }));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-indigo-300" />
        <h2 className="text-2xl font-bold text-white">Redshift Calculator</h2>
      </div>
      
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

      <div className="mt-6 p-4 bg-indigo-900 bg-opacity-30 rounded-lg border border-indigo-500/20">
        <p className="text-lg font-semibold text-indigo-200">
          Estimated Redshift: <span className="text-white">{calculateRedshift(magnitudes)}</span>
        </p>
      </div>
    </div>
  );
};

export default RedshiftCalculator;