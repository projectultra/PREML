import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { initializeIframeCommunication } from '../utils/hscmapComms';

interface SkyMapProps {
  width: number;
  height: number;
}

const SkyMap: React.FC<SkyMapProps> = ({ width, height }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [windowId, setWindowId] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [selection, setSelection] = useState<string>('');

  const apiBaseUrl = typeof window !== 'undefined' ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

  useEffect(() => {
    axios
      .post(`${apiBaseUrl}/api/window/new`, { title: 'My HSC Map' })
      .then((response) => {
        const { id, url } = response.data;
        setWindowId(id);
        setIframeUrl(new URL(url, apiBaseUrl).toString());


      })
      .catch((error) => {
        console.error('Failed to create window:', error);
      });
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!iframeRef.current || !windowId) return;

    const cleanup = initializeIframeCommunication(
      iframeRef.current,
      windowId,
      (message) => {
        if (message.type === 'callback') {
          axios.post(`${apiBaseUrl}/api/window/${windowId}/callback/${message.args.cbid}`, {
            args: message.args.args,
          }).catch((error) => console.error('Callback error:', error));
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
    <div className="relative w-full h-full">
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
      {selection && (
        <div
          className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded opacity-90"
        >
          {selection}
        </div>
      )}
    </div>
  );
};

export default SkyMap;