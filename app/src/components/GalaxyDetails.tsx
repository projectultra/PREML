import React from 'react';
import { Star, Loader2 } from 'lucide-react';

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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-indigo-300" />
        <h2 className="text-2xl font-bold text-white">Galaxy Details</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-300" />
          <span className="ml-2 text-indigo-200">Loading galaxy details...</span>
        </div>
      ) : galaxy ? (
        <div className="space-y-4">
          {/* Galaxy Information */}
          <div>
            <p className="text-indigo-200">
              <span className="font-semibold">Object ID:</span> {galaxy.object_id}
            </p>
            <p className="text-indigo-200">
              <span className="font-semibold">RA:</span> {galaxy.ra?.toFixed(4) ?? 'N/A'}°
            </p>
            <p className="text-indigo-200">
              <span className="font-semibold">Dec:</span> {galaxy.dec?.toFixed(4) ?? 'N/A'}°
            </p>
            <p className="text-indigo-200">
              <span className="font-semibold">Redshift:</span>{' '}
              {galaxy.redshift !== null ? galaxy.redshift.toFixed(3) : 'N/A'}
            </p>
            <p className="text-indigo-200">
              <span className="font-semibold">Morphology:</span> {galaxy.morphology ?? 'N/A'}
            </p>
          </div>

          {/* Cutout Images */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Cutout Images</h3>
            {isCutoutsLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-300" />
                <span className="ml-2 text-indigo-200">Loading cutout images...</span>
              </div>
            ) : cutoutImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {cutoutImages.map((image, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg flex flex-col items-center">
                    <p className="text-indigo-200 text-sm text-center mb-1">{image.filter}</p>
                    {image.error || !image.url ? (
                      <p className="text-red-400 text-sm text-center">Error: {image.error || 'No image available'}</p>
                    ) : (
                      <img
                        src={image.url}
                        alt={`${image.filter} cutout`}
                        className="w-full max-w-[150px] h-32 object-contain rounded-b"
                        onError={() => console.error(`Failed to load cutout for ${image.filter}`)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-indigo-200">No cutout images available.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-indigo-200">Select a galaxy to view details.</p>
      )}
    </div>
  );
};

export default GalaxyDetails;