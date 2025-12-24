import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2, Star } from 'lucide-react';
import { initializeIframeCommunication } from '../utils/hscmapComms';

interface SkyMapProps {
  width: number;
  height: number;
  onGalaxySelect: (details: GalaxyDetails | null, isLoading: boolean) => void;
}

interface Galaxy {
  id: string;
  ra: number;
  dec: number;
  distance: number;
  magnitude?: number;
}

interface GalaxyDetails {
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

interface SkyMapProps {
  width: number;
  height: number;
  onGalaxySelect: (details: GalaxyDetails | null, isLoading: boolean) => void;
}

const SkyMap: React.FC<SkyMapProps> = ({ width, height, onGalaxySelect }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [windowId, setWindowId] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [selection, setSelection] = useState<string>('');
  const [nearbyGalaxies, setNearbyGalaxies] = useState<Galaxy[]>([]);
  const [selectedGalaxyId, setSelectedGalaxyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [raDecInput, setRaDecInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Use relative paths to leverage Vite proxy and avoid mixed content errors in production
  const apiBaseUrl = "";
  console.log(`SkyMap: apiBaseUrl="${apiBaseUrl}" (forced to relative)`);

  // Parse RA and Dec from input string like "α=75.194502° δ=-33.193044°"
  const parseRaDec = (input: string): { ra: number; dec: number } | null => {
    console.log(`parseRaDec: Action=Parsing input, input="${input}"`);
    try {
      const raMatch = input.match(/α=(-?\d+\.\d+)°/);
      const decMatch = input.match(/δ=(-?\d+\.\d+)°/);
      if (!raMatch || !decMatch) {
        console.log('parseRaDec: Action=Failed to match RA or Dec patterns');
        return null;
      }
      const ra = parseFloat(raMatch[1]);
      const dec = parseFloat(decMatch[1]);
      if (isNaN(ra) || isNaN(dec)) {
        console.log('parseRaDec: Action=Parsed values are not numbers, ra=', raMatch[1], 'dec=', decMatch[1]);
        return null;
      }
      console.log(`parseRaDec: Action=Parsed RA=${ra.toFixed(6)}, Dec=${dec.toFixed(6)}`);
      return { ra, dec };
    } catch (err) {
      console.error('parseRaDec: Action=Error parsing input, error=', err);
      return null;
    }
  };

  // Query nearby galaxies
  const queryHscDatabase = async (ra: number, dec: number) => {
    console.log(`queryHscDatabase: Action=Querying with RA=${ra.toFixed(6)}, Dec=${dec.toFixed(6)}`);
    setIsLoading(true);
    try {
      const url = `${apiBaseUrl}/api/queryGalaxies`;
      console.log(`queryHscDatabase: Requesting URL="${url}"`);
      const response = await axios.post(url, {
        ra,
        dec,
        radius: 10 / 3600, // 10 arcseconds
      });
      const galaxies = response.data.galaxies || [];
      // Sort by object_id
      galaxies.sort((a: Galaxy, b: Galaxy) => a.id.localeCompare(b.id));
      setNearbyGalaxies(galaxies);
      setSelectedGalaxyId(null); // Clear selection
      onGalaxySelect(null, false); // Clear magnitudes
      console.log(`queryHscDatabase: Action=Received ${galaxies.length} galaxies`, galaxies);
    } catch (error: any) {
      console.error(`queryHscDatabase: Action=Failed, error=`, error);
      setNearbyGalaxies([]);
      setSelectedGalaxyId(null);
      onGalaxySelect(null, false);
      setError(error.response?.data?.error || 'Failed to query galaxies');
    } finally {
      setIsLoading(false);
    }
  };

  // Query details (g, r, i, z, y magnitudes) for a specific galaxy
  const queryGalaxyDetails = async (objectId: string, ra: number, dec: number) => {
    console.log(`queryGalaxyDetails: Action=Querying details for object_id=${objectId}`);
    onGalaxySelect(null, true); // Set loading
    try {
      const url = `${apiBaseUrl}/api/queryGalaxyDetails`;
      console.log(`queryGalaxyDetails: Requesting URL="${url}"`);
      const response = await axios.post(url, { object_id: objectId });
      const details = response.data.details;
      onGalaxySelect({ ...details, ra, dec }, false); // Include RA and Dec
      console.log(`queryGalaxyDetails: Action=Received details`, details);
    } catch (error: any) {
      console.error(`queryGalaxyDetails: Action=Failed, error=`, error);
      onGalaxySelect(null, false);
      setError(error.response?.data?.error || 'Failed to query galaxy details');
    }
  };

  // Handle galaxy selection
  const handleGalaxySelect = (galaxy: Galaxy) => {
    setSelectedGalaxyId(galaxy.id);
    queryGalaxyDetails(galaxy.id, galaxy.ra, galaxy.dec);
    console.log(`handleGalaxySelect: Action=Selected galaxy, id=${galaxy.id}`);
  };

  // Handle search button click
  const handleSearchGalaxies = () => {
    console.log(`handleSearchGalaxies: Action=Button clicked, input="${raDecInput}"`);
    const raDec = parseRaDec(raDecInput);
    if (raDec) {
      queryHscDatabase(raDec.ra, raDec.dec);
    } else {
      console.log('handleSearchGalaxies: Action=Invalid RA/Dec input');
      setError('Please enter valid RA and Dec (e.g., α=75.194502° δ=-33.193044°)');
    }
  };

  // Initialize window
  useEffect(() => {
    const url = `${apiBaseUrl}/api/window/new`;
    console.log(`createWindow: Requesting URL="${url}"`);
    axios
      .post(url, { title: 'My HSC Map' })
      .then((response) => {
        const { id, url } = response.data;
        setWindowId(id);
        setIframeUrl(new URL(url, apiBaseUrl || window.location.origin).toString());
        console.log(`createWindow: Action=Created window, id=${id}, url=${url}`);
      })
      .catch((error) => {
        console.error('createWindow: Action=Failed to create window, error=', error);
        setError('Failed to initialize SkyMap');
      });
  }, [apiBaseUrl]);

  // Handle iframe communication
  useEffect(() => {
    if (!iframeRef.current || !windowId) return;

    const cleanup = initializeIframeCommunication(
      iframeRef.current,
      windowId,
      (message) => {
        console.log(`handleIframeMessage: Action=Received message`, { type: message.type, args: message.args });
        if (message.type === 'callback') {
          const url = `${apiBaseUrl}/api/window/${windowId}/callback/${message.args.cbid}`;
          console.log(`handleIframeMessage: Callback URL="${url}"`);
          axios
            .post(url, {
              args: message.args.args,
            })
            .catch((error) => console.error('Callback error:', error));
        } else if (message.type === 'catalog_click') {
          const { catalog_id, index, ra, dec } = message.args;
          console.log(`Catalog click: catalog_id=${catalog_id}, index=${index}, ra=${ra}, dec=${dec}`);
          setSelection(`Point: RA=${ra.toFixed(4)}, Dec=${dec.toFixed(4)}`);
          const url = `${apiBaseUrl}/api/window/${windowId}/selection`;
          console.log(`handleIframeMessage: Selection URL="${url}"`);
          axios
            .post(url, {
              type: 'point',
              catalog_id,
              index,
              ra,
              dec,
            })
            .catch((error) => console.error('Failed to send point selection:', error));
        } else if (message.type === 'region_selection') {
          const { area } = message.args;
          const [c0, c1] = area;
          console.log(`Region selection: c0={a=${c0.a}, d=${c0.d}}, c1={a=${c1.a}, d=${c1.d}}`);
          setSelection(
            `Region: RA1=${(c0.a * 180 / Math.PI).toFixed(4)}, Dec1=${(c0.d * 180 / Math.PI).toFixed(4)}, ` +
            `RA2=${(c1.a * 180 / Math.PI).toFixed(4)}, Dec2=${(c1.d * 180 / Math.PI).toFixed(4)}`
          );
          const url = `${apiBaseUrl}/api/window/${windowId}/selection`;
          console.log(`handleIframeMessage: Region Selection URL="${url}"`);
          axios
            .post(url, {
              type: 'region',
              area,
            })
            .catch((error) => console.error('Failed to send region selection:', error));
        } else if (message.type === 'sync_from_frontend') {
          console.log('Sync from frontend:', message.args);
        }
      }
    );

    // Add catalog
    const catalogUrl = `${apiBaseUrl}/api/window/${windowId}/catalog/new`;
    console.log(`SkyMap: Adding catalog URL="${catalogUrl}"`);
    axios
      .post(catalogUrl, {
        ra: [150.0, 151.0],
        dec: [1.0, 2.0],
        name: 'Sample Catalog',
        columns: { mag: [20.5, 21.0] },
        color: [0, 1, 0, 0.5],
      })
      .then((response) => {
        console.log('Catalog added:', response.data);
      })
      .catch((error) => console.error('Failed to add catalog:', error));

    // Jump to position
    const jumpUrl = `${apiBaseUrl}/api/window/${windowId}/jump_to`;
    console.log(`SkyMap: Jump to URL="${jumpUrl}"`);
    axios
      .post(jumpUrl, {
        ra: 150.5,
        dec: 1.5,
        fov: 1.0,
      })
      .then(() => console.log('Jumped to position'))
      .catch((error) => console.error('Failed to jump to position:', error));

    return cleanup;
  }, [windowId, apiBaseUrl]);

  if (!iframeUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full gap-6">
      {/* Iframe Map Container */}
      <div className="relative flex-1 tech-panel overflow-hidden">
        <iframe
          ref={iframeRef}
          title="HSC Map"
          src={iframeUrl}
          width="100%"
          height={height}
          className="w-full grayscale contrast-125"
          style={{ backgroundColor: '#000', minHeight: `${height}px` }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />

        {/* Center Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-500/40" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-blue-500/40" />
            <div className="absolute inset-0 border border-blue-500/20 rounded-full" />
            <div className="absolute inset-[45%] bg-blue-500 rounded-full shadow-[0_0_8px_var(--accent-blue)]" />
          </div>
        </div>

        {/* Overlays */}
        {selection && (
          <div className="absolute top-4 left-4 z-20">
            <div className="px-3 py-1.5 bg-slate-950/90 border border-slate-800 text-[10px] font-bold mono text-blue-400 uppercase tracking-widest">
              <span className="text-slate-600 mr-2">Selection:</span>
              {selection}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 z-20">
            <div className="px-3 py-1.5 bg-red-950/90 border border-red-500/50 text-[10px] font-bold mono text-red-400 uppercase tracking-widest">
              Error: {error}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Search Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="tech-label">Coordinate_Input</span>
            <input
              id="raDecInput"
              type="text"
              value={raDecInput}
              onChange={(e) => setRaDecInput(e.target.value)}
              placeholder="α=75.1945° δ=-33.1930°"
              className="input-tech w-full"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSearchGalaxies}
            disabled={isLoading}
            className="btn-tech btn-tech-primary w-full py-3 justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Star className="w-4 h-4" />
            )}
            {isLoading ? 'Scanning...' : 'Execute_Search'}
          </button>
        </div>

        {/* Results Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="tech-header py-2 mb-2">
            <span className="tech-label">Detected_Objects</span>
            <span className="mono text-[10px] font-bold text-blue-400">[{nearbyGalaxies.length}]</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-900/30 border border-slate-800 border-dashed">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="mono text-[10px] font-bold text-slate-600 uppercase">Analyzing_Sector...</span>
              </div>
            ) : nearbyGalaxies.length > 0 ? (
              nearbyGalaxies.map((galaxy) => (
                <button
                  key={galaxy.id}
                  onClick={() => handleGalaxySelect(galaxy)}
                  className={`w-full p-3 text-left transition-all border mono ${selectedGalaxyId === galaxy.id
                    ? 'bg-blue-600/10 border-blue-500/50'
                    : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold ${selectedGalaxyId === galaxy.id ? 'text-blue-400' : 'text-slate-400'}`}>
                      ID: {galaxy.id}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedGalaxyId === galaxy.id ? 'bg-blue-500 shadow-[0_0_4px_var(--accent-blue)]' : 'bg-slate-800'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-600 uppercase">RA</p>
                      <p className="text-[10px] font-bold text-slate-300">{galaxy.ra.toFixed(4)}°</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-600 uppercase">DEC</p>
                      <p className="text-[10px] font-bold text-slate-300">{galaxy.dec.toFixed(4)}°</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-900/20 border border-slate-800 border-dashed">
                <p className="mono text-[10px] text-slate-600 uppercase italic">No_Objects_Detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>


  );
};

export default SkyMap;