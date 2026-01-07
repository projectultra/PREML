import React, { useState } from 'react';
import { Telescope, Star, Sparkles } from 'lucide-react';
import RedshiftCalculator from '../components/RedshiftCalculator';
import SkyMap from '../components/SkyMap';
import GalaxyDetails from '../components/GalaxyDetails';
import axios from 'axios';

import { GalaxyDetailsInterface, CutoutImage } from '../types';

const Dashboard: React.FC = () => {
    const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyDetailsInterface | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [cutoutImages, setCutoutImages] = useState<CutoutImage[]>([]);
    const [isCutoutsLoading, setIsCutoutsLoading] = useState(false);
    const apiBaseUrl = '';

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Sky Map */}
            <div className="lg:col-span-8 space-y-6">
                <section className="tech-panel">
                    <div className="tech-header">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-blue-400" />
                            <span className="tech-label">Spatial_Intelligence_Map</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="mono text-xs text-slate-500 font-bold">SOURCE: GAIA_DR2</span>
                            <span className="mono text-xs text-slate-500 font-bold">LAYER: PANSTARRS</span>
                        </div>
                    </div>
                    <div className="p-4 bg-black/40">
                        <SkyMap width={800} height={550} onGalaxySelect={handleGalaxySelect} />
                    </div>
                    <div className="border-t border-slate-800 p-2 flex justify-between items-center bg-slate-900/20">
                        <span className="mono text-xs text-slate-600">COORDINATE_SYSTEM: J2000</span>
                        <span className="mono text-xs text-slate-600">PROJECTION: EQUIRECTANGULAR</span>
                    </div>
                </section>

                {/* Galaxy Details */}
                <section className="tech-panel">
                    <div className="tech-header">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="tech-label">Object_Telemetry_Analysis</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <GalaxyDetails
                            galaxy={selectedGalaxy}
                            cutoutImages={cutoutImages}
                            isLoading={isDetailsLoading}
                            isCutoutsLoading={isCutoutsLoading}
                        />
                    </div>
                </section>
            </div>

            {/* Right Column: Calculator */}
            <div className="lg:col-span-4 space-y-6">
                <section className="tech-panel sticky top-24">
                    <div className="tech-header">
                        <div className="flex items-center gap-2">
                            <Telescope className="w-4 h-4 text-blue-400" />
                            <span className="tech-label">Neural_Inference_Engine</span>
                        </div>
                    </div>
                    <div className="p-6">
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
                    <div className="border-t border-slate-800 p-4 bg-slate-900/20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-1 bg-blue-400" />
                            <span className="tech-label text-[9px]">Model_Parameters</span>
                        </div>
                        <p className="mono text-xs text-slate-500 leading-relaxed">
                            Deep neural network trained on HSC-SSP PDR3 dataset.
                            Inference latency: &lt; 45ms.
                            Confidence threshold: 0.92.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
