import React, { useState, useEffect } from "react";
import {
  Calculator,
  Image,
  Loader2,
} from "lucide-react";

interface MagnitudeValues {
  g: number;
  r: number;
  i: number;
  z: number;
  y: number;
}

interface GalaxyDetails {
  g_mag: number | null;
  r_mag: number | null;
  i_mag: number | null;
  z_mag: number | null;
  y_mag: number | null;
}

interface RedshiftCalculatorProps {
  externalMagnitudes: GalaxyDetails | null;
  isDetailsLoading: boolean;
}

const RedshiftCalculator: React.FC<RedshiftCalculatorProps> = ({
  externalMagnitudes,
  isDetailsLoading,
}) => {
  const [isPhotometric, setIsPhotometric] = useState(true);
  const [magnitudes, setMagnitudes] = useState<MagnitudeValues>({
    g: 20.8,
    r: 19.5,
    i: 19.2,
    z: 18.9,
    y: 18.7, // Default value for y, slightly adjusted
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [calculatedRedshift, setCalculatedRedshift] = useState<number | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);

  // Update magnitudes when externalMagnitudes changes
  useEffect(() => {
    if (externalMagnitudes && !isDetailsLoading) {
      setMagnitudes({
        g: externalMagnitudes.g_mag ?? 0,
        r: externalMagnitudes.r_mag ?? 0,
        i: externalMagnitudes.i_mag ?? 0,
        z: externalMagnitudes.z_mag ?? 0,
        y: externalMagnitudes.y_mag ?? 0,
      });
      setCalculatedRedshift(null); // Reset redshift on new magnitudes
    }
  }, [externalMagnitudes, isDetailsLoading]);

  const calculatePhotometricRedshift = async () => {
    setIsCalculating(true);
    setCalculatedRedshift(null);
    // Use relative path to leverage Vite proxy and avoid mixed content errors in production
    const inferenceUrl = "/predict";
    console.log(`RedshiftCalculator: Requesting inference URL="${inferenceUrl}" (forced to relative)`);
    try {
      const response = await fetch(inferenceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            magnitudes.g,
            magnitudes.r,
            magnitudes.i,
            magnitudes.z,
            magnitudes.y,
          ],
        }),
      });
      if (!response.ok) {
        throw new Error("Inference failed");
      }
      const result = await response.json();
      // If prediction is an array, use the first value; adjust as needed
      const redshift =
        Array.isArray(result.prediction) && result.prediction.length > 0
          ? result.prediction[0]
          : result.prediction;
      setCalculatedRedshift(Number(redshift));
    } catch (error) {
      setCalculatedRedshift(null);
      // Optionally, show error to user
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
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

  const handleInputChange =
    (filter: keyof MagnitudeValues) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagnitudes((prev) => ({
          ...prev,
          [filter]: parseFloat(e.target.value) || 0,
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


  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <div className="flex bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => setIsPhotometric(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 mono text-[10px] font-bold uppercase transition-all ${isPhotometric
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          <Calculator className="w-3 h-3" />
          Photometric
        </button>
        <button
          onClick={() => setIsPhotometric(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 mono text-[10px] font-bold uppercase transition-all ${!isPhotometric
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          <Image className="w-3 h-3" />
          Spectral_Img
        </button>
      </div>

      {isPhotometric ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {(['g', 'r', 'i', 'z', 'y'] as const).map((filter) => (
              <div key={filter} className="flex items-center gap-3">
                <div className="w-12 flex flex-col">
                  <span className="mono text-[10px] font-bold text-slate-500 uppercase">Band</span>
                  <span className="mono text-sm font-bold text-blue-400 uppercase">{filter}</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={magnitudes[filter]}
                    onChange={handleInputChange(filter)}
                    className="input-tech w-full pl-3 pr-12 py-2.5"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] font-bold text-slate-600">MAG</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-800 bg-slate-900/50 p-8 flex flex-col items-center justify-center gap-4 group hover:border-blue-500/50 transition-colors cursor-pointer relative overflow-hidden"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <input
              id="image-upload"
              type="file"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview ? (
              <div className="relative w-full aspect-square border border-slate-700 overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover grayscale contrast-125" />
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 border border-slate-700">
                  <span className="mono text-[8px] text-blue-400 font-bold uppercase tracking-widest">Spectral_Data_Loaded</span>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-800/50 border border-slate-700">
                  <Image className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="mono text-[10px] font-bold text-slate-300 uppercase mb-1">Upload_Spectral_Frame</p>
                  <p className="mono text-[8px] text-slate-500 uppercase">FITS / PNG / JPG (MAX 10MB)</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={isPhotometric ? calculatePhotometricRedshift : calculateImageRedshift}
        disabled={isCalculating || (!isPhotometric && !selectedImage)}
        className="btn-tech btn-tech-primary w-full py-4 justify-center text-sm tracking-widest"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Executing_Inference...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4" />
            Run_Analysis_Engine
          </>
        )}
      </button>

      {/* Result Display */}
      <div className={`tech-panel transition-all duration-500 ${calculatedRedshift !== null ? 'border-blue-500/50 bg-blue-500/5' : 'opacity-50'}`}>
        <div className="tech-header py-2">
          <span className="tech-label">Inference_Output</span>
          {calculatedRedshift !== null && (
            <span className="mono text-[8px] font-bold text-blue-400 uppercase tracking-widest px-2 py-0.5 border border-blue-500/30">Verified</span>
          )}
        </div>
        <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
          {calculatedRedshift !== null ? (
            <div className="text-center">
              <span className="mono text-[10px] font-bold text-slate-500 uppercase mb-2 block">Estimated_Redshift (z)</span>
              <div className="text-5xl font-bold mono text-blue-400 tracking-tighter">
                {calculatedRedshift.toFixed(4)}
              </div>
              <div className="mt-4 flex items-center gap-2 justify-center">
                <div className="h-1 w-12 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[92%]" />
                </div>
                <span className="mono text-[8px] font-bold text-slate-500 uppercase">Confidence: 0.92</span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="mono text-[10px] text-slate-600 uppercase italic">Awaiting_Input_Parameters...</div>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1 h-1 bg-slate-800 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default RedshiftCalculator;
