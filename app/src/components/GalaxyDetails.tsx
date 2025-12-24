import React from 'react';
import { Loader2, Telescope } from 'lucide-react';

interface GalaxyDetailsProps {
  galaxy: {
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
  } | null;
  cutoutImages: { url: string; filter: string; error?: string }[];
  isLoading: boolean;
  isCutoutsLoading: boolean;
}

const GalaxyDetails: React.FC<GalaxyDetailsProps> = ({ galaxy, cutoutImages, isLoading, isCutoutsLoading }) => {
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600" />
          <div>
            <span className="tech-label block">Object_Identifier</span>
            <span className="mono text-xl font-bold text-slate-200">{galaxy?.object_id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="mono text-[10px] font-bold text-blue-400 px-2 py-1 bg-blue-500/10 border border-blue-500/30 uppercase tracking-widest">Target_Locked</span>
          <span className="mono text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-800 border border-slate-700 uppercase tracking-widest">HSC_SSP_PDR3</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <span className="text-slate-400 font-medium animate-pulse">Retrieving astronomical data...</span>
        </div>
      ) : galaxy ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Right_Ascension', value: `${galaxy.ra?.toFixed(6)}°`, icon: 'RA' },
              { label: 'Declination', value: `${galaxy.dec?.toFixed(6)}°`, icon: 'DEC' },
              { label: 'Spectroscopic_Z', value: galaxy.redshift?.toFixed(4) || 'N/A', icon: 'Z' },
              { label: 'Morphology_Class', value: galaxy.morphology || 'UNKNOWN', icon: 'TYPE' },
            ].map((stat) => (
              <div key={stat.label} className="tech-panel p-4 group">
                <span className="tech-label text-[9px] mb-1 block group-hover:text-blue-400 transition-colors">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="mono text-sm font-bold text-slate-200">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Multispectral Imaging */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="tech-label">Multispectral_Imaging_Array</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {isCutoutsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-slate-900/50 border border-slate-800">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initializing_Sensor_Array...</span>
              </div>
            ) : cutoutImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {cutoutImages.map((img, idx) => (
                  <div key={idx} className="tech-panel overflow-hidden group">
                    <div className="tech-header py-1.5 px-3">
                      <span className="mono text-[10px] font-bold text-blue-400">{img.filter}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <div className="aspect-square relative bg-black">
                      {img.url ? (
                        <>
                          <img src={img.url} alt={img.filter} className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center">
                          <span className="mono text-[8px] text-red-500/50 uppercase font-bold">{img.error || 'Sensor_Failure'}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900/50 border-t border-slate-800">
                      <span className="mono text-[8px] text-slate-600 uppercase font-bold">Band_Capture_OK</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center glass-effect rounded-3xl border-dashed">
                <p className="text-slate-500 text-sm italic">No multispectral data available for this coordinate.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-effect rounded-3xl border-dashed border-slate-800">
          <div className="p-4 bg-slate-900/50 rounded-full border border-slate-800">
            <Telescope className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-300 font-medium">No Galaxy Selected</p>
            <p className="text-slate-500 text-sm max-w-[240px]">Select a celestial object from the sky map to view detailed analysis.</p>
          </div>
        </div>
      )}
    </div>

  );
};

export default GalaxyDetails;