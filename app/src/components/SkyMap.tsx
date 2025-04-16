import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
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

  const apiBaseUrl = typeof window !== 'undefined' ? 'http://localhost:7333' : (import.meta.env.VITE_API_URL || 'http://localhost:7333');

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
      const response = await axios.post(`${apiBaseUrl}/api/queryGalaxies`, {
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
      const response = await axios.post(`${apiBaseUrl}/api/queryGalaxyDetails`, { object_id: objectId });
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
    axios
      .post(`${apiBaseUrl}/api/window/new`, { title: 'My HSC Map' })
      .then((response) => {
        const { id, url } = response.data;
        setWindowId(id);
        setIframeUrl(new URL(url, apiBaseUrl).toString());
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
          axios
            .post(`${apiBaseUrl}/api/window/${windowId}/callback/${message.args.cbid}`, {
              args: message.args.args,
            })
            .catch((error) => console.error('Callback error:', error));
        } else if (message.type === 'catalog_click') {
          const { catalog_id, index, ra, dec } = message.args;
          console.log(`Catalog click: catalog_id=${catalog_id}, index=${index}, ra=${ra}, dec=${dec}`);
          setSelection(`Point: RA=${ra.toFixed(4)}, Dec=${dec.toFixed(4)}`);
          axios
            .post(`${apiBaseUrl}/api/window/${windowId}/selection`, {
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
          axios
            .post(`${apiBaseUrl}/api/window/${windowId}/selection`, {
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
    axios
      .post(`${apiBaseUrl}/api/window/${windowId}/catalog/new`, {
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
    axios
      .post(`${apiBaseUrl}/api/window/${windowId}/jump_to`, {
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
    <div className="flex w-full h-full">
      {/* Iframe Map */}
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <iframe
          ref={iframeRef}
          title="HSC Map"
          src={iframeUrl}
          width={width}
          height={height}
          className="rounded-lg shadow-lg border border-indigo-500/20"
          style={{ backgroundColor: '#000' }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
        {/* Red circle in the center */}
        <div
          className="absolute rounded-full border-2 border-red-500"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        {selection && (
          <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded opacity-90">
            {selection}
          </div>
        )}
        {error && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded opacity-90">
            Error: {error}
          </div>
        )}
      </div>
      {/* Sidebar with Input, Button, and Galaxy List */}
      <div className="ml-4 flex flex-col space-y-4 w-80">
        {/* Input and Button */}
        <div>
          <label htmlFor="raDecInput" className="block text-white mb-1">
            Enter RA and Dec (e.g., α=75.194502° δ=-33.193044°)
          </label>
          <input
            id="raDecInput"
            type="text"
            value={raDecInput}
            onChange={(e) => setRaDecInput(e.target.value)}
            placeholder="α=75.194502° δ=-33.193044°"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSearchGalaxies}
          className={`flex items-center justify-center px-4 py-2 rounded text-white ${
            isLoading ? 'bg-indigo-800 opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Search Nearby Galaxies'
          )}
        </button>
        {/* Collapsible Galaxy List */}
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer">
              <h3 className="text-lg font-semibold">
                Found {nearbyGalaxies.length} object{nearbyGalaxies.length !== 1 ? 's' : ''} nearby
              </h3>
              <span className="text-indigo-300 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            {isLoading ? (
              <div className="mt-2 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-300" />
                <span className="ml-2 text-gray-400">Loading galaxies...</span>
              </div>
            ) : nearbyGalaxies.length > 0 ? (
              <ul className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {nearbyGalaxies.map((galaxy) => (
                  <li
                    key={galaxy.id}
                    onClick={() => handleGalaxySelect(galaxy)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedGalaxyId === galaxy.id
                        ? 'bg-indigo-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-sm">
                      <span className="font-medium">ID:</span> {galaxy.id}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">RA:</span> {galaxy.ra.toFixed(4)}°
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Dec:</span> {galaxy.dec.toFixed(4)}°
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-400">No galaxies found.</p>
            )}
          </details>
        </div>
      </div>
    </div>
  );
};

export default SkyMap;