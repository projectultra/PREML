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

  useEffect(() => {
    // Initialize new window
    axios
      .post('/api/window/new', { title: 'My HSC Map' })
      .then((response) => {
        const { id, url } = response.data;
        setWindowId(id);
        setIframeUrl(url);
      })
      .catch((error) => {
        console.error('Failed to create window:', error);
      });
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !windowId) return;

    const cleanup = initializeIframeCommunication(
      iframeRef.current,
      windowId,
      (message) => {
        // Handle messages from iframe
        if (message.type === 'callback') {
          axios.post(`/api/window/${windowId}/callback/${message.args.cbid}`, {
            args: message.args.args,
          });
        } else if (message.type === 'sync_from_frontend') {
          console.log('Sync from frontend:', message.args);
        }
      }
    );

    // Example: Add a sample catalog
    axios
      .post(`/api/window/${windowId}/catalog/new`, {
        ra: [150.0, 151.0],
        dec: [1.0, 2.0],
        name: 'Sample Catalog',
        columns: { mag: [20.5, 21.0] },
        color: [0, 1, 0, 0.5],
      })
      .then((response) => {
        console.log('Catalog added:', response.data);
      });

    // Example: Jump to coordinates
    axios.post(`/api/window/${windowId}/jump_to`, {
      ra: 150.5,
      dec: 1.5,
      fov: 1.0,
    });

    return cleanup;
  }, [windowId]);

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
    </div>
  );
};

export default SkyMap;