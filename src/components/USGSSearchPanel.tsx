import React, { useState } from 'react';
import { USGSEarthquakeFeature, USGSGeoJSON } from '../types/seismic';
import { getDepthColor, downloadGeoJSON, getDataPath } from '../utils/geoUtils';
import { Search, RefreshCw, Download, Calendar, Filter, MapPin, ChevronRight, AlertCircle } from 'lucide-react';

interface USGSSearchPanelProps {
  usgsData: USGSGeoJSON | null;
  onUpdateUSGSData: (data: USGSGeoJSON) => void;
  minMagnitude: number;
  onMinMagnitudeChange: (mag: number) => void;
  onSelectQuake: (quake: USGSEarthquakeFeature) => void;
  selectedQuake: USGSEarthquakeFeature | null;
}

export const USGSSearchPanel: React.FC<USGSSearchPanelProps> = ({
  usgsData,
  onUpdateUSGSData,
  minMagnitude,
  onMinMagnitudeChange,
  onSelectQuake,
  selectedQuake
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeWindow, setTimeWindow] = useState<'all' | '30d' | '7d' | '24h'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchLiveUSGS = async (preset: '30d' | '7d' | '24h') => {
    setIsLoading(true);
    setApiError(null);
    setTimeWindow(preset);

    const now = new Date();
    let startTime = new Date();

    if (preset === '24h') {
      startTime.setHours(now.getHours() - 24);
    } else if (preset === '7d') {
      startTime.setDate(now.getDate() - 7);
    } else if (preset === '30d') {
      startTime.setDate(now.getDate() - 30);
    }

    const startIso = startTime.toISOString();
    const endIso = now.toISOString();

    // Myanmar bounding box: minlat 9.0, maxlat 29.0, minlon 92.0, maxlon 102.0
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startIso}&endtime=${endIso}&minmagnitude=3.0&minlatitude=9.0&maxlatitude=29.0&minlongitude=92.0&maxlongitude=102.0&limit=500`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`USGS HTTP ${resp.status}`);
      const data: USGSGeoJSON = await resp.json();
      onUpdateUSGSData(data);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch live USGS data');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadBundledDataset = async () => {
    setIsLoading(true);
    setApiError(null);
    setTimeWindow('all');
    try {
      const resp = await fetch(getDataPath('data/usgs_myanmar_earthquakes.geojson'));
      const data: USGSGeoJSON = await resp.json();
      onUpdateUSGSData(data);
    } catch (err: any) {
      setApiError('Failed to load bundled USGS dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!usgsData) return;
    downloadGeoJSON(usgsData, 'USGS_Myanmar_Earthquakes.geojson');
  };

  // Filtered quake list
  const filteredQuakes = React.useMemo(() => {
    if (!usgsData) return [];
    return usgsData.features
      .filter(q => q.properties.mag >= minMagnitude)
      .filter(q => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
          q.properties.place?.toLowerCase().includes(s) ||
          q.properties.title?.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.properties.time - a.properties.time);
  }, [usgsData, minMagnitude, searchTerm]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              USGS Seismic Search
            </h3>
            <p className="text-[10px] text-slate-400">
              Myanmar & Regional Boundary (M3.0+)
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          title="Download USGS GeoJSON"
          className="text-xs py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 transition-colors"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>

      {/* Query Bar & Presets */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <span>Query Range:</span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => fetchLiveUSGS('24h')}
              disabled={isLoading}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                timeWindow === '24h'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              24h Live
            </button>
            <button
              onClick={() => fetchLiveUSGS('7d')}
              disabled={isLoading}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                timeWindow === '7d'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => fetchLiveUSGS('30d')}
              disabled={isLoading}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                timeWindow === '30d'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={reloadBundledDataset}
              disabled={isLoading}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                timeWindow === 'all'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1,000 Catalog
            </button>
          </div>
        </div>

        {/* Magnitude Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Min Magnitude:</span>
            <span className="font-mono font-bold text-amber-400">
              M &ge; {minMagnitude.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="6.5"
            step="0.1"
            value={minMagnitude}
            onChange={e => onMinMagnitudeChange(parseFloat(e.target.value))}
            className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Place Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter location (e.g., Tedim, Mandalay, Sagaing)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="px-3 py-1.5 bg-slate-950 text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800 font-mono">
        <span>
          Showing <span className="text-white font-bold">{filteredQuakes.length}</span> earthquakes
        </span>
        {isLoading && (
          <span className="text-amber-400 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Fetching USGS...
          </span>
        )}
      </div>

      {apiError && (
        <div className="m-2 p-2 bg-rose-950/50 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* List of Events */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {filteredQuakes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No earthquakes found matching the selected filters.
          </div>
        ) : (
          filteredQuakes.map(quake => {
            const isSelected = selectedQuake?.id === quake.id;
            const mag = quake.properties.mag;
            const depth = quake.geometry.coordinates[2] ?? 10;
            const depthColor = getDepthColor(depth);
            const timeFormatted = new Date(quake.properties.time).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={quake.id}
                onClick={() => onSelectQuake(quake)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-rose-950/40 border border-rose-500/50'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Mag Badge */}
                <div
                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 font-mono font-bold text-white shadow"
                  style={{
                    backgroundColor: mag >= 5.5 ? '#b91c1c' : mag >= 4.5 ? '#ea580c' : '#0284c7'
                  }}
                >
                  <span className="text-xs leading-none">M</span>
                  <span className="text-sm leading-none">{mag.toFixed(1)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium truncate text-xs">
                    {quake.properties.place || 'Myanmar Region'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>{timeFormatted}</span>
                    <span>&bull;</span>
                    <span style={{ color: depthColor }}>
                      {depth.toFixed(0)} km depth
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
