/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SeismicMap } from './components/SeismicMap';
import { DMHBulletinCard } from './components/DMHBulletinCard';
import { USGSSearchPanel } from './components/USGSSearchPanel';
import { FaultsExplorerPanel } from './components/FaultsExplorerPanel';
import { ExportModal } from './components/ExportModal';
import { TectonicGuideModal } from './components/TectonicGuideModal';
import { DMH_TEDIM_QUAKE } from './data/dmhQuakeData';
import { ActiveFaultFeature, ActiveFaultGeoJSON, BasemapId, USGSEarthquakeFeature, USGSGeoJSON } from './types/seismic';
import { getDepthColor, getFaultColor } from './utils/geoUtils';
import { 
  Activity, 
  Layers, 
  Search, 
  X, 
  ChevronRight, 
  Target, 
  ExternalLink, 
  Info,
  Ruler,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [faultsData, setFaultsData] = useState<ActiveFaultGeoJSON | null>(null);
  const [usgsData, setUsgsData] = useState<USGSGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);

  // Map & Visual States
  const [basemap, setBasemap] = useState<BasemapId>('esri-satellite');
  const [showFaults, setShowFaults] = useState(true);
  const [showUSGS, setShowUSGS] = useState(true);
  const [showDMH, setShowDMH] = useState(true);
  const [selectedSlipType, setSelectedSlipType] = useState<string>('all');
  const [minMagnitude, setMinMagnitude] = useState<number>(3.5);
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measuredPoint, setMeasuredPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [centerTarget, setCenterTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Inspector & Selection
  const [selectedFault, setSelectedFault] = useState<ActiveFaultFeature | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<USGSEarthquakeFeature | null>(null);

  // Tab State on Sidebar: 'dmh' | 'faults' | 'usgs'
  const [activeTab, setActiveTab] = useState<'dmh' | 'faults' | 'usgs'>('dmh');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Load GeoJSON datasets
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const [faultsRes, usgsRes] = await Promise.all([
          fetch('/data/myanmar_active_faults.geojson'),
          fetch('/data/usgs_myanmar_earthquakes.geojson')
        ]);

        if (faultsRes.ok) {
          const fData = await faultsRes.json();
          setFaultsData(fData);
        }
        if (usgsRes.ok) {
          const uData = await usgsRes.json();
          setUsgsData(uData);
        }
      } catch (err) {
        console.error('Error loading GeoJSON datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  const handleFlyToEpicenter = () => {
    setCenterTarget({
      lat: DMH_TEDIM_QUAKE.latitude,
      lng: DMH_TEDIM_QUAKE.longitude,
      zoom: 10
    });
    setActiveTab('dmh');
    setIsSidebarOpen(true);
  };

  const handleResetMyanmar = () => {
    setCenterTarget({
      lat: 21.9,
      lng: 95.9,
      zoom: 6
    });
  };

  const handleSelectFault = (fault: ActiveFaultFeature | null) => {
    setSelectedFault(fault);
    if (fault) {
      // Find representative coordinate to center
      const coords = fault.geometry.coordinates;
      let centerCoord: number[] = [96.0, 21.0];
      if (fault.geometry.type === 'LineString' && (coords as number[][]).length > 0) {
        const midIdx = Math.floor((coords as number[][]).length / 2);
        centerCoord = (coords as number[][])[midIdx];
      } else if (fault.geometry.type === 'MultiLineString' && (coords as number[][][]).length > 0) {
        const firstLine = (coords as number[][][])[0];
        const midIdx = Math.floor(firstLine.length / 2);
        centerCoord = firstLine[midIdx];
      }
      setCenterTarget({
        lat: centerCoord[1],
        lng: centerCoord[0],
        zoom: 8
      });
      setActiveTab('faults');
    }
  };

  const handleSelectQuake = (quake: USGSEarthquakeFeature | null) => {
    setSelectedQuake(quake);
    if (quake) {
      setCenterTarget({
        lat: quake.geometry.coordinates[1],
        lng: quake.geometry.coordinates[0],
        zoom: 9
      });
      setActiveTab('usgs');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        basemap={basemap}
        onSelectBasemap={setBasemap}
        showFaults={showFaults}
        onToggleFaults={() => setShowFaults(!showFaults)}
        showUSGS={showUSGS}
        onToggleUSGS={() => setShowUSGS(!showUSGS)}
        showDMH={showDMH}
        onToggleDMH={() => setShowDMH(!showDMH)}
        measureMode={measureMode}
        onToggleMeasure={() => {
          setMeasureMode(!measureMode);
          if (measureMode) setMeasuredPoint(null);
        }}
        onFlyToEpicenter={handleFlyToEpicenter}
        onResetView={handleResetMyanmar}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        faultsCount={faultsData?.features.length || 398}
        usgsCount={usgsData?.features.length || 1000}
      />

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Full Viewport Map */}
        <div className="flex-1 h-full w-full relative">
          <SeismicMap
            dmhQuake={DMH_TEDIM_QUAKE}
            faultsData={faultsData}
            usgsData={usgsData}
            basemap={basemap}
            showFaults={showFaults}
            showUSGS={showUSGS}
            showDMH={showDMH}
            selectedSlipType={selectedSlipType}
            minMagnitude={minMagnitude}
            selectedFault={selectedFault}
            onSelectFault={handleSelectFault}
            selectedQuake={selectedQuake}
            onSelectQuake={handleSelectQuake}
            measureMode={measureMode}
            onMeasurePoint={setMeasuredPoint}
            centerTarget={centerTarget}
          />

          {/* Measure Mode Banner */}
          {measureMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-sky-950/90 border border-sky-500/50 text-sky-200 px-4 py-2 rounded-full text-xs shadow-xl flex items-center gap-2 backdrop-blur-md">
              <Ruler className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>
                <strong>Measurement Active:</strong> Click anywhere on the map to calculate straight-line distance to the Tedim M3.7 epicenter.
              </span>
              <button
                onClick={() => setMeasureMode(false)}
                className="ml-2 text-sky-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Floating Map Legend */}
          <div className="absolute bottom-5 left-5 z-20 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md text-[11px] max-w-[280px] pointer-events-auto">
            <div className="font-bold text-slate-200 text-xs mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Map Legend
              </span>
              <span className="text-[10px] text-slate-400 font-mono">GEM & USGS</span>
            </div>

            {/* Extracted DMH Quake */}
            <div className="mb-2 pb-2 border-b border-slate-800/60">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                Extracted Event (mm_quake.jpg)
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="text-white font-medium">Tedim Quake M3.7 (12 km Depth)</span>
              </div>
            </div>

            {/* Fault Slip Types */}
            <div className="mb-2 pb-2 border-b border-slate-800/60">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                Active Faults (GEM Database)
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-rose-500 rounded"></span>
                  <span className="text-slate-300">Dextral (Sagaing)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded"></span>
                  <span className="text-slate-300">Sinistral</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-cyan-400 rounded"></span>
                  <span className="text-slate-300">Normal (Rift)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-purple-500 rounded"></span>
                  <span className="text-slate-300">Reverse / Thrust</span>
                </div>
              </div>
            </div>

            {/* Earthquakes by Depth */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                Earthquakes by Depth
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &lt;20km
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 20-40km
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> &gt;70km
                </div>
              </div>
            </div>
          </div>

          {/* Selected Feature Bottom Card Inspector */}
          {(selectedFault || selectedQuake) && (
            <div className="absolute top-5 right-5 z-20 max-w-sm w-full bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  {selectedFault ? 'Active Fault Segment' : 'USGS Earthquake Details'}
                </span>
                <button
                  onClick={() => {
                    setSelectedFault(null);
                    setSelectedQuake(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedFault && (
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID / Catalog:</span>
                    <span className="text-white font-mono font-semibold">
                      {selectedFault.properties.catalog_id || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slip Mechanism:</span>
                    <span
                      className="font-medium px-1.5 py-0.5 rounded text-[10px] font-mono"
                      style={{
                        color: getFaultColor(selectedFault.properties.slip_type),
                        backgroundColor: `${getFaultColor(selectedFault.properties.slip_type)}20`
                      }}
                    >
                      {selectedFault.properties.slip_type_formatted || selectedFault.properties.slip_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tectonic Province:</span>
                    <span className="text-slate-200">{selectedFault.properties.tectonic_zone}</span>
                  </div>
                  {selectedFault.properties.length_km && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trace Length:</span>
                      <span className="text-white font-mono">{selectedFault.properties.length_km} km</span>
                    </div>
                  )}
                  {selectedFault.properties.net_slip_rate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slip Rate:</span>
                      <span className="text-cyan-400 font-mono">{selectedFault.properties.net_slip_rate} mm/yr</span>
                    </div>
                  )}
                  {selectedFault.properties.average_dip && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dip / Direction:</span>
                      <span className="text-slate-300 font-mono">{selectedFault.properties.average_dip}° {selectedFault.properties.dip_dir || ''}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedQuake && (
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white font-mono">
                      M {selectedQuake.properties.mag.toFixed(1)}
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${getDepthColor(selectedQuake.geometry.coordinates[2] ?? 10)}25`,
                        color: getDepthColor(selectedQuake.geometry.coordinates[2] ?? 10)
                      }}
                    >
                      Depth: {selectedQuake.geometry.coordinates[2]?.toFixed(1) ?? '10'} km
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium text-[11px]">
                    {selectedQuake.properties.place}
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                    <span>Coordinates:</span>
                    <span>
                      {selectedQuake.geometry.coordinates[1].toFixed(2)}° N,{' '}
                      {selectedQuake.geometry.coordinates[0].toFixed(2)}° E
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                    <span>Time:</span>
                    <span>
                      {new Date(selectedQuake.properties.time).toLocaleString('en-GB', {
                        timeZone: 'Asia/Yangon'
                      })}
                    </span>
                  </div>
                  {selectedQuake.properties.url && (
                    <div className="pt-2">
                      <a
                        href={selectedQuake.properties.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                      >
                        View Official USGS ShakeMap & Events <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Sidebar Toggle Button if closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 bg-slate-900 border border-slate-700 text-white p-2 rounded-xl shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors text-xs font-medium"
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Open Inspector Panel</span>
          </button>
        )}

        {/* Collapsible Left Inspector Sidebar */}
        {isSidebarOpen && (
          <div className="w-[380px] h-full bg-slate-900/95 border-r border-slate-800 flex flex-col z-20 backdrop-blur-lg shadow-2xl shrink-0 transition-all">
            {/* Sidebar Tab Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 p-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('dmh')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'dmh'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>DMH Quake</span>
                </button>
                <button
                  onClick={() => setActiveTab('faults')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'faults'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Faults ({faultsData?.features.length || 398})</span>
                </button>
                <button
                  onClick={() => setActiveTab('usgs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'usgs'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>USGS</span>
                </button>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Collapse Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'dmh' && (
                <DMHBulletinCard
                  quake={DMH_TEDIM_QUAKE}
                  faults={faultsData?.features || []}
                  onFlyToEpicenter={handleFlyToEpicenter}
                  onSelectNearestFault={handleSelectFault}
                />
              )}

              {activeTab === 'faults' && (
                <FaultsExplorerPanel
                  faultsData={faultsData}
                  selectedFault={selectedFault}
                  onSelectFault={handleSelectFault}
                  selectedSlipType={selectedSlipType}
                  onSelectSlipType={setSelectedSlipType}
                />
              )}

              {activeTab === 'usgs' && (
                <USGSSearchPanel
                  usgsData={usgsData}
                  onUpdateUSGSData={setUsgsData}
                  minMagnitude={minMagnitude}
                  onMinMagnitudeChange={setMinMagnitude}
                  onSelectQuake={handleSelectQuake}
                  selectedQuake={selectedQuake}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Export & Download GeoJSON Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        faultsData={faultsData}
        dmhQuake={DMH_TEDIM_QUAKE}
        usgsData={usgsData}
      />

      {/* Tectonic Framework Guide Modal */}
      <TectonicGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
