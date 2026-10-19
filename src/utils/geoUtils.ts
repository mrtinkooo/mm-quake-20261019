import { ActiveFaultFeature } from '../types/seismic';

/**
 * Calculates Haversine distance in km between two lat/lon points
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest point on any fault feature and returns distance in km and the fault feature
 */
export function findNearestFault(
  targetLat: number,
  targetLon: number,
  faults: ActiveFaultFeature[]
): { fault: ActiveFaultFeature | null; minDistanceKm: number } {
  let minDistance = Infinity;
  let nearestFault: ActiveFaultFeature | null = null;

  for (const fault of faults) {
    const geom = fault.geometry;
    if (!geom || !geom.coordinates) continue;

    const checkCoord = (pt: number[]) => {
      const lon = pt[0];
      const lat = pt[1];
      const dist = haversineDistance(targetLat, targetLon, lat, lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearestFault = fault;
      }
    };

    if (geom.type === 'LineString') {
      (geom.coordinates as number[][]).forEach(checkCoord);
    } else if (geom.type === 'MultiLineString') {
      (geom.coordinates as number[][][]).forEach(sub => sub.forEach(checkCoord));
    }
  }

  return { fault: nearestFault, minDistanceKm: Math.round(minDistance * 10) / 10 };
}

/**
 * Color mapper for fault slip types
 */
export function getFaultColor(slipType?: string): string {
  if (!slipType) return '#94a3b8'; // Slate default
  const lower = slipType.toLowerCase();
  if (lower.includes('dextral')) return '#f43f5e'; // Rose / crimson (Right-lateral, e.g. Sagaing Fault)
  if (lower.includes('sinistral')) return '#f59e0b'; // Amber / orange (Left-lateral)
  if (lower.includes('normal')) return '#06b6d4'; // Cyan (Extensional)
  if (lower.includes('reverse') || lower.includes('thrust')) return '#a855f7'; // Purple / violet (Compressional)
  if (lower.includes('ridge') || lower.includes('transform')) return '#10b981'; // Emerald
  return '#e2e8f0';
}

/**
 * Color mapper for earthquake focal depth (Shallow to Deep)
 */
export function getDepthColor(depthKm: number): string {
  if (depthKm <= 20) return '#ef4444'; // Shallow (0-20km) - high surface shaking risk
  if (depthKm <= 40) return '#f97316'; // Shallow-intermediate (20-40km)
  if (depthKm <= 70) return '#eab308'; // Intermediate (40-70km)
  if (depthKm <= 150) return '#3b82f6'; // Deep (70-150km)
  return '#8b5cf6'; // Very deep (>150km)
}

/**
 * Download a GeoJSON object or text as a file in the browser
 */
export function downloadGeoJSON(data: object | string, filename: string): void {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/geo+json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.geojson') ? filename : `${filename}.geojson`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
