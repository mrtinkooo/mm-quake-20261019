import React from 'react';
import { BasemapId } from '../types/seismic';
import { 
  Activity, 
  Layers, 
  Map as MapIcon, 
  Download, 
  BookOpen, 
  Ruler, 
  Compass, 
  Target,
  Eye,
  EyeOff
} from 'lucide-react';

interface NavbarProps {
  basemap: BasemapId;
  onSelectBasemap: (basemap: BasemapId) => void;
  showFaults: boolean;
  onToggleFaults: () => void;
  showUSGS: boolean;
  onToggleUSGS: () => void;
  showDMH: boolean;
  onToggleDMH: () => void;
  measureMode: boolean;
  onToggleMeasure: () => void;
  onFlyToEpicenter: () => void;
  onResetView: () => void;
  onOpenExportModal: () => void;
  onOpenGuideModal: () => void;
  faultsCount: number;
  usgsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  basemap,
  onSelectBasemap,
  showFaults,
  onToggleFaults,
  showUSGS,
  onToggleUSGS,
  showDMH,
  onToggleDMH,
  measureMode,
  onToggleMeasure,
  onFlyToEpicenter,
  onResetView,
  onOpenExportModal,
  onOpenGuideModal,
  faultsCount,
  usgsCount
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 text-slate-100 px-4 py-2.5 backdrop-blur-md z-30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Brand & Stats */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950 text-white">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">
              Myanmar Seismic & Active Faults Explorer
            </h1>
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
              Tedim Quake M3.7 Highlighted
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            DMH Nay Pyi Taw Bulletin &bull; GEM Active Faults ({faultsCount}) &bull; USGS Earthquakes ({usgsCount})
          </p>
        </div>
      </div>

      {/* Middle Map & Layer Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Basemap Picker */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs">
          <button
            onClick={() => onSelectBasemap('esri-satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              basemap === 'esri-satellite'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => onSelectBasemap('carto-dark')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              basemap === 'carto-dark'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => onSelectBasemap('opentopo')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              basemap === 'opentopo'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Topo
          </button>
          <button
            onClick={() => onSelectBasemap('carto-voyager')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              basemap === 'carto-voyager'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voyager
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={onToggleFaults}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              showFaults
                ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle GEM Active Faults"
          >
            <Layers className="w-3 h-3" />
            <span>Faults</span>
          </button>
          <button
            onClick={onToggleUSGS}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              showUSGS
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle USGS Earthquakes"
          >
            <Activity className="w-3 h-3" />
            <span>USGS</span>
          </button>
          <button
            onClick={onToggleDMH}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              showDMH
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle DMH Tedim Epicenter"
          >
            <Target className="w-3 h-3" />
            <span>DMH Quake</span>
          </button>
        </div>

        {/* Measure Tool Toggle */}
        <button
          onClick={onToggleMeasure}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
            measureMode
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Click on map to measure distance to Tedim epicenter"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Measure</span>
        </button>

        {/* Epicenter FlyTo & Myanmar Reset */}
        <button
          onClick={onFlyToEpicenter}
          className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Zoom to extracted DMH Tedim epicenter"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Tedim (M3.7)</span>
        </button>

        <button
          onClick={onResetView}
          className="px-2 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          title="Reset to whole Myanmar view"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGuideModal}
          className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tectonics</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all hover:scale-[1.02]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export GeoJSON</span>
        </button>
      </div>
    </header>
  );
};
