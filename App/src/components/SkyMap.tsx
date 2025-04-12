import React, { useEffect, useRef } from 'react';

interface SkyMapProps {
  width: number;
  height: number;
}

const SkyMap: React.FC<SkyMapProps> = ({ width, height }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // WWT will automatically initialize when the iframe loads
  }, []);

  return (
    <div className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        title="WorldWide Telescope"
        src="https://web.wwtassets.org/research/latest/?script=eyJldmVudCI6ImNlbnRlcl9vbl9jb29yZGluYXRlcyIsInJhIjoxMS4yODM0MzQ5NTIzMTIwNTMsImRlYyI6NDEuNzQ1NzMyODUzMzU1MTgsImZvdiI6MC44NzM2NzcxMDAwMzQ4ODY5LCJyb2xsIjotNjYuMDYyMDMzNzc4NTgzODcsImluc3RhbnQiOnRydWV9%2CeyJldmVudCI6InNldF9iYWNrZ3JvdW5kX2J5X25hbWUiLCJuYW1lIjoiUGFuU1RBUlJTMSAzcGkifQ%3D%3D%2CeyJldmVudCI6ImxheWVyX2hpcHNjYXRfbG9hZCIsInRocmVhZElkIjoiNGI0NjAxNzEtZWQ3MC00Nzk3LWJhOGMtZmFiNjdkYTllMmFiIiwidGFibGVJZCI6IkdhaWEgRFIyIChHYWlhIENvbGxhYm9yYXRpb24sIDIwMTgpIChnYWlhMikiLCJuYW1lIjoiR2FpYSBEUjIgKEdhaWEgQ29sbGFib3JhdGlvbiwgMjAxOCkgKGdhaWEyKSJ9%2CeyJldmVudCI6InRhYmxlX2xheWVyX3NldF9tdWx0aSIsImlkIjoiR2FpYSBEUjIgKEdhaWEgQ29sbGFib3JhdGlvbiwgMjAxOCkgKGdhaWEyKSIsInNldHRpbmdzIjpbImFzdHJvbm9taWNhbCIsImNvbG9yIiwiZW5hYmxlZCIsImZhZGVTcGFuIiwibmFtZSIsIm9wYWNpdHkiLCJvcGVuZWQiLCJyZWZlcmVuY2VGcmFtZSIsInZlcnNpb24iLCJhbHRDb2x1bW4iLCJhbHRUeXBlIiwiYWx0VW5pdCIsImJhckNoYXJ0Qml0bWFzayIsImJlZ2luUmFuZ2UiLCJjYXJ0ZXNpYW5DdXN0b21TY2FsZSIsImNhcnRlc2lhblNjYWxlIiwiY29sb3JNYXBDb2x1bW4iLCJjb2xvck1hcHBlck5hbWUiLCJjb29yZGluYXRlc1R5cGUiLCJkZWNheSIsImR5bmFtaWNDb2xvciIsImR5bmFtaWNEYXRhIiwiZW5kRGF0ZUNvbHVtbiIsImVuZFJhbmdlIiwiZ2VvbWV0cnlDb2x1bW4iLCJoeXBlcmxpbmtDb2x1bW4iLCJoeXBlcmxpbmtGb3JtYXQiLCJsYXRDb2x1bW4iLCJsbmdDb2x1bW4iLCJtYXJrZXJDb2x1bW4iLCJtYXJrZXJJbmRleCIsIm1hcmtlclNjYWxlIiwibmFtZUNvbHVtbiIsIm5vcm1hbGl6ZUNvbG9yTWFwIiwibm9ybWFsaXplQ29sb3JNYXBNYXgiLCJub3JtYWxpemVDb2xvck1hcE1pbiIsIm5vcm1hbGl6ZVNpemUiLCJub3JtYWxpemVTaXplQ2xpcCIsIm5vcm1hbGl6ZVNpemVNYXgiLCJub3JtYWxpemVTaXplTWluIiwicGxvdFR5cGUiLCJwb2ludFNjYWxlVHlwZSIsInJhVW5pdHMiLCJzY2FsZUZhY3RvciIsInNob3dGYXJTaWRlIiwic2l6ZUNvbHVtbiIsInN0YXJ0RGF0ZUNvbHVtbiIsInRpbWVTZXJpZXMiLCJ4QXhpc0NvbHVtbiIsInhBeGlzUmV2ZXJzZSIsInlBeGlzQ29sdW1uIiwieUF4aXNSZXZlcnNlIiwiekF4aXNDb2x1bW4iLCJ6QXhpc1JldmVyc2UiXSwidmFsdWVzIjpbdHJ1ZSwiIzc1RkYzRiIsdHJ1ZSwwLCJHYWlhIERSMiAoR2FpYSBDb2xsYWJvcmF0aW9uLCAyMDE4KSAoZ2FpYTIpIiwxLGZhbHNlLCJTa3kiLDIsLTEsInNlYUxldmVsIiwibWV0ZXJzIiwwLCIyMTAwLTAxLTAxVDA1OjAwOjAwLjAwMFoiLDEsIm1ldGVycyIsLTEsIkdyZXlzIiwic3BoZXJpY2FsIiwxNixmYWxzZSxmYWxzZSwtMSwiMTgwMC0wMS0wMVQwNDo1NjowMi4wMDBaIiwtMSwtMSwiIiwxLDAsLTEsMCwid29ybGQiLDAsZmFsc2UsMSwwLGZhbHNlLGZhbHNlLDEsMCwiY2lyY2xlIiw0LCJkZWdyZWVzIiwxLGZhbHNlLDE5LC0xLGZhbHNlLC0xLGZhbHNlLC0xLGZhbHNlLC0xLGZhbHNlXX0%3D%2CeyJldmVudCI6ImxvYWRfaW1hZ2VfY29sbGVjdGlvbiIsInVybCI6Imh0dHA6Ly9kYXRhMS53d3Rhc3NldHMub3JnL3BhY2thZ2VzLzIwMjEvMDlfcGhhdF9maXRzL2luZGV4Lnd0bWwiLCJsb2FkQ2hpbGRGb2xkZXJzIjp0cnVlfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX2NyZWF0ZSIsImlkIjoiUEhBVC1mNDc1dyIsInVybCI6Imh0dHA6Ly9kYXRhMS53d3Rhc3NldHMub3JnL3BhY2thZ2VzLzIwMjEvMDlfcGhhdF9maXRzL2Y0NzV3L3sxfS97M30vezN9X3syfS5maXRzIiwibW9kZSI6InByZWxvYWRlZCIsImdvdG8iOmZhbHNlfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX3NldF9tdWx0aSIsImlkIjoiUEhBVC1mNDc1dyIsInNldHRpbmdzIjpbImFzdHJvbm9taWNhbCIsImNvbG9yIiwiZW5hYmxlZCIsImZhZGVTcGFuIiwibmFtZSIsIm9wYWNpdHkiLCJvcGVuZWQiLCJyZWZlcmVuY2VGcmFtZSIsInZlcnNpb24iLCJjb2xvck1hcHBlck5hbWUiLCJvdmVycmlkZURlZmF1bHRMYXllciJdLCJ2YWx1ZXMiOlt0cnVlLHsiYSI6MjU1LCJiIjoyNTUsImciOjI1NSwiciI6MjU1LCJuYW1lIjoiIn0sdHJ1ZSwwLCJQSEFULWY0NzV3IiwxLGZhbHNlLCJTa3kiLDIsInBsYXNtYSIsZmFsc2VdfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX3N0cmV0Y2giLCJpZCI6IlBIQVQtZjQ3NXciLCJ2ZXJzaW9uIjoxLCJzdHJldGNoIjoxLCJ2bWluIjowLjAzOTA2MjA3OTA0MjE5NjI3LCJ2bWF4IjozLjc0OTQ0Njk0OTkwODUxOTJ9"
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