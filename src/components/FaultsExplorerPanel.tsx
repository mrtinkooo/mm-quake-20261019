import React, { useState } from 'react';
import { ActiveFaultFeature, ActiveFaultGeoJSON } from '../types/seismic';
import { getFaultColor, downloadGeoJSON } from '../utils/geoUtils';
import { Layers, Download, Search, Info, Compass, ChevronRight, Activity } from 'lucide-react';

interface FaultsExplorerPanelProps {
  faultsData: ActiveFaultGeoJSON | null;
  selectedFault: ActiveFaultFeature | null;
  onSelectFault: (fault: ActiveFaultFeature) => void;
  selectedSlipType: string;
  onSelectSlipType: (type: string) => void;
}

export const FaultsExplorerPanel: React.FC<FaultsExplorerPanelProps> = ({
  faultsData,
  selectedFault,
  onSelectFault,
  selectedSlipType,
  onSelectSlipType
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const slipTypes = React.useMemo(() => {
    if (!faultsData) return [];
    const types = new Set<string>();
    faultsData.features.forEach(f => {
      if (f.properties.slip_type) types.add(f.properties.slip_type);
    });
    return Array.from(types).sort();
  }, [faultsData]);

  const tectonicZones = React.useMemo(() => {
    if (!faultsData) return [];
    const zones = new Set<string>();
    faultsData.features.forEach(f => {
      if (f.properties.tectonic_zone) zones.add(f.properties.tectonic_zone);
    });
    return Array.from(zones).sort();
  }, [faultsData]);

  const filteredFaults = React.useMemo(() => {
    if (!faultsData) return [];
    return faultsData.features
      .filter(f => {
        if (selectedSlipType !== 'all' && f.properties.slip_type !== selectedSlipType) return false;
        if (selectedZone !== 'all' && f.properties.tectonic_zone !== selectedZone) return false;
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const matchId = f.properties.catalog_id?.toLowerCase().includes(s);
          const matchZone = f.properties.tectonic_zone?.toLowerCase().includes(s);
          const matchType = f.properties.slip_type?.toLowerCase().includes(s);
          return matchId || matchZone || matchType;
        }
        return true;
      })
      .sort((a, b) => (b.properties.length_km || 0) - (a.properties.length_km || 0));
  }, [faultsData, selectedSlipType, selectedZone, searchTerm]);

  const totalLengthKm = React.useMemo(() => {
    return Math.round(
      filteredFaults.reduce((sum, f) => sum + (f.properties.length_km || 0), 0)
    );
  }, [filteredFaults]);

  const handleExportGeoJSON = () => {
    if (!faultsData) return;
    downloadGeoJSON(faultsData, 'Myanmar_Active_Faults_GEM.geojson');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-500" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              GEM Active Faults Database
            </h3>
            <p className="text-[10px] text-slate-400">
              Myanmar Active Tectonics (EOS & GEM Tools)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportGeoJSON}
          title="Download Complete Myanmar Active Faults GeoJSON"
          className="text-xs py-1.5 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium flex items-center gap-1.5 transition-colors shadow"
        >
          <Download className="w-3 h-3" />
          Export GeoJSON
        </button>
      </div>

      {/* Filter Options */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Slip Type Filter */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Slip Mechanism
            </label>
            <select
              value={selectedSlipType}
              onChange={e => onSelectSlipType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Mechanisms ({faultsData?.features.length || 0})</option>
              {slipTypes.map(st => (
                <option key={st} value={st}>
                  {st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Tectonic Zone Filter */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Tectonic Zone
            </label>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Zones</option>
              {tectonicZones.map(tz => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by catalog ID (e.g., EOS_AF0001)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="px-3 py-1.5 bg-slate-950 text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800 font-mono">
        <span>
          Segments: <strong className="text-white">{filteredFaults.length}</strong>
        </span>
        <span>
          Total Trace: <strong className="text-rose-400">{totalLengthKm.toLocaleString()} km</strong>
        </span>
      </div>

      {/* Fault Segments List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {filteredFaults.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active faults matching criteria.
          </div>
        ) : (
          filteredFaults.map(fault => {
            const isSelected =
              selectedFault?.properties.catalog_id === fault.properties.catalog_id;
            const color = getFaultColor(fault.properties.slip_type);

            return (
              <div
                key={fault.properties.catalog_id || Math.random()}
                onClick={() => onSelectFault(fault)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-rose-950/40 border border-rose-500/50'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-8 rounded-full shrink-0 shadow"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        {fault.properties.catalog_id || 'Fault Segment'}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium"
                        style={{
                          background: `${color}20`,
                          color: color,
                          border: `1px solid ${color}40`
                        }}
                      >
                        {fault.properties.slip_type_formatted || fault.properties.slip_type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {fault.properties.tectonic_zone} &bull; {fault.properties.catalog_name}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-white">
                    {fault.properties.length_km ? `${fault.properties.length_km} km` : '--'}
                  </div>
                  {fault.properties.net_slip_rate && (
                    <div className="text-[10px] font-mono text-cyan-400">
                      {fault.properties.net_slip_rate} mm/yr
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
