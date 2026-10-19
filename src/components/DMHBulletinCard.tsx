import React from 'react';
import { DMHEarthquakeInfo, ActiveFaultFeature } from '../types/seismic';
import { findNearestFault, downloadGeoJSON } from '../utils/geoUtils';
import { 
  Activity, 
  MapPin, 
  Compass, 
  Phone, 
  ExternalLink, 
  Download, 
  Target, 
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DMHBulletinCardProps {
  quake: DMHEarthquakeInfo;
  faults: ActiveFaultFeature[];
  onFlyToEpicenter: () => void;
  onSelectNearestFault?: (fault: ActiveFaultFeature) => void;
}

export const DMHBulletinCard: React.FC<DMHBulletinCardProps> = ({
  quake,
  faults,
  onFlyToEpicenter,
  onSelectNearestFault
}) => {
  const { fault: nearestFault, minDistanceKm } = React.useMemo(() => {
    return findNearestFault(quake.latitude, quake.longitude, faults);
  }, [quake.latitude, quake.longitude, faults]);

  const handleDownloadQuakeGeoJSON = () => {
    fetch(import.meta.env.BASE_URL + 'data/extracted_dmh_quake.geojson')
      .then(res => res.json())
      .then(data => downloadGeoJSON(data, 'DMH_Tedim_Earthquake_20261019.geojson'))
      .catch(() => {
        // Fallback export if fetch fails
        const fallback = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [quake.longitude, quake.latitude, quake.depthKm]
              },
              properties: { ...quake }
            }
          ]
        };
        downloadGeoJSON(fallback, 'DMH_Tedim_Earthquake_20261019.geojson');
      });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Official DMH Header Styled after mm_quake.jpg */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-3.5 border-b border-blue-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1">
              <Activity className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-100">
                Department of Meteorology and Hydrology
              </h3>
              <p className="text-[11px] text-blue-200/90">
                Seismological Division &bull; Nay Pyi Taw
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-950/80 text-blue-200 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
            Official Bulletin
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-blue-700/40 flex items-center justify-between text-[11px] text-blue-200/80 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> Tel: {quake.tel}
            </span>
            <span>Fax: {quake.fax}</span>
          </div>
          <a
            href={quake.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 hover:text-amber-200 flex items-center gap-1 text-[11px] transition-colors"
          >
            moezala.gov.mm <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Extracted Parameters Table (matching mm_quake.jpg) */}
      <div className="p-4 space-y-4">
        {/* Yellow header banner like original DMH graphic */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Earthquake Information
          </span>
          <span className="text-[11px] font-mono bg-slate-950/20 px-2 py-0.5 rounded">
            Extracted from mm_quake.jpg
          </span>
        </div>

        {/* Structured Data Grid */}
        <div className="bg-slate-950/60 rounded-lg border border-slate-800 divide-y divide-slate-800/80 overflow-hidden text-xs">
          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Date</span>
            <span className="col-span-2 text-white font-mono font-semibold">
              {quake.date}
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Time (MST)</span>
            <div className="col-span-2 flex items-center justify-between">
              <span className="text-white font-mono font-semibold">
                {quake.timeMst} <span className="text-slate-400 font-normal text-[11px]">MST</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({quake.timeUtc})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors bg-rose-950/20">
            <span className="text-slate-400 font-medium">Magnitude</span>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-rose-400 font-mono font-bold text-sm">
                {quake.magnitude.toFixed(1)}
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-medium">
                {quake.magnitudeClassification}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Latitude</span>
            <span className="col-span-2 text-white font-mono">
              {quake.latitude.toFixed(2)}° N
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Longitude</span>
            <span className="col-span-2 text-white font-mono">
              {quake.longitude.toFixed(2)}° E
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Depth</span>
            <span className="col-span-2 text-amber-400 font-mono font-semibold">
              {quake.depthKm} km <span className="text-slate-400 font-normal text-[10px]">(Crustal / Shallow)</span>
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 hover:bg-slate-800/30 transition-colors">
            <span className="text-slate-400 font-medium">Region</span>
            <span className="col-span-2 text-cyan-300 font-medium">
              {quake.region}
            </span>
          </div>
        </div>

        {/* Nearest Fault Proximity Analysis */}
        {nearestFault && (
          <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Nearest Active Fault (GEM Database)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                {minDistanceKm} km away
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Fault System:</span>
                <span className="font-medium text-white">{nearestFault.properties.tectonic_zone || 'Indo-Burman Wedge'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slip Mechanism:</span>
                <span className="font-mono text-amber-300">{nearestFault.properties.slip_type_formatted || nearestFault.properties.slip_type}</span>
              </div>
              {nearestFault.properties.catalog_id && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Catalog ID:</span>
                  <span className="font-mono text-slate-300">{nearestFault.properties.catalog_id}</span>
                </div>
              )}
            </div>
            {onSelectNearestFault && (
              <button
                onClick={() => onSelectNearestFault(nearestFault)}
                className="mt-2 w-full py-1.5 px-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center gap-1 transition-colors"
              >
                Inspect Nearest Fault Line <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Nearest Settlements */}
        <div className="text-xs space-y-2">
          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Surrounding Regional Centers
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {quake.nearestTowns.slice(0, 4).map((t, idx) => (
              <div key={idx} className="bg-slate-950/40 p-2 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 truncate">{t.name.split('(')[0]}</span>
                <span className="font-mono font-medium text-amber-400 shrink-0 ml-1">
                  {t.distanceKm} km {t.direction}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={onFlyToEpicenter}
            className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Target className="w-3.5 h-3.5" />
            Zoom to Epicenter
          </button>
          <button
            onClick={handleDownloadQuakeGeoJSON}
            title="Download Tedim Quake GeoJSON"
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            GeoJSON
          </button>
        </div>
      </div>
    </div>
  );
};
