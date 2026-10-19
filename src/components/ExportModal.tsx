import React, { useState } from 'react';
import { downloadGeoJSON } from '../utils/geoUtils';
import { ActiveFaultGeoJSON, DMHEarthquakeInfo, USGSGeoJSON } from '../types/seismic';
import { X, Download, FileJson, Copy, Check, ShieldCheck, Database, Layers } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  faultsData: ActiveFaultGeoJSON | null;
  dmhQuake: DMHEarthquakeInfo;
  usgsData: USGSGeoJSON | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  faultsData,
  dmhQuake,
  usgsData
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'preview'>('download');
  const [selectedPreview, setSelectedPreview] = useState<'faults' | 'dmh' | 'usgs'>('faults');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFaults = () => {
    if (!faultsData) return;
    downloadGeoJSON(faultsData, 'Myanmar_Active_Faults_GEM.geojson');
  };

  const handleDownloadDMH = () => {
    fetch(import.meta.env.BASE_URL + 'data/extracted_dmh_quake.geojson')
      .then(res => res.json())
      .then(data => downloadGeoJSON(data, 'Extracted_DMH_Tedim_Quake.geojson'))
      .catch(() => {
        const payload = {
          type: 'FeatureCollection',
          name: 'Myanmar_DMH_Extracted_Earthquake_Tedim',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [dmhQuake.longitude, dmhQuake.latitude, dmhQuake.depthKm]
              },
              properties: { ...dmhQuake }
            }
          ]
        };
        downloadGeoJSON(payload, 'Extracted_DMH_Tedim_Quake.geojson');
      });
  };

  const handleDownloadUSGS = () => {
    if (!usgsData) return;
    downloadGeoJSON(usgsData, 'USGS_Myanmar_Earthquakes.geojson');
  };

  const getPreviewContent = () => {
    if (selectedPreview === 'faults') {
      if (!faultsData) return '// Loading GEM faults...';
      const sample = {
        type: 'FeatureCollection',
        name: 'Myanmar_Active_Faults_GEM',
        total_features: faultsData.features.length,
        sample_feature: faultsData.features[0]
      };
      return JSON.stringify(sample, null, 2);
    }
    if (selectedPreview === 'dmh') {
      const sample = {
        type: 'FeatureCollection',
        name: 'Myanmar_DMH_Extracted_Earthquake_Tedim',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [dmhQuake.longitude, dmhQuake.latitude, dmhQuake.depthKm]
            },
            properties: { ...dmhQuake }
          }
        ]
      };
      return JSON.stringify(sample, null, 2);
    }
    if (selectedPreview === 'usgs') {
      if (!usgsData) return '// Loading USGS quakes...';
      const sample = {
        type: 'FeatureCollection',
        metadata: usgsData.metadata,
        sample_feature: usgsData.features[0]
      };
      return JSON.stringify(sample, null, 2);
    }
    return '';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPreviewContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                GeoJSON Datasets & Exports
              </h2>
              <p className="text-[11px] text-slate-400">
                RFC 7946 Compliant GeoJSON Exports for GIS & Web Mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Direct Downloads
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" /> Schema & JSON Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'download' ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed">
                All datasets are ready for immediate use in QGIS, ArcGIS, Mapbox, Leaflet, or Python GeoPandas.
              </div>

              {/* Dataset 1: GEM Myanmar Active Faults */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Myanmar Active Faults Dataset (GEM Global Active Faults)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Extracted from GEM Science Tools database. 398 active fault traces with slip type, dip angle, length, and seismogenic depth.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {faultsData?.features.length || 398} Features
                      </span>
                      <span>~890 KB</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Valid GeoJSON
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadFaults}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-lg shadow-rose-950 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              {/* Dataset 2: DMH Extracted Earthquake */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Extracted DMH Tedim Earthquake (19.10.2026 M3.7)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Extracted from mm_quake.jpg. Includes full DMH bulletin parameters, epicenter coordinate (23.38°N, 93.52°E), focal depth 12 km.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
                        1 Point Feature
                      </span>
                      <span>~1.3 KB</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Complete Metadata
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadDMH}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-950 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              {/* Dataset 3: USGS Earthquakes */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      USGS Myanmar Earthquake Catalog
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Regional seismic events from USGS FDSN Web Service covering Myanmar plate boundaries.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                        {usgsData?.features.length || 1000} Features
                      </span>
                      <span>~1.1 MB</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> FDSN GeoJSON
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadUSGS}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-950 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPreview('faults')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      selectedPreview === 'faults'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    GEM Faults
                  </button>
                  <button
                    onClick={() => setSelectedPreview('dmh')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      selectedPreview === 'dmh'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    DMH Tedim Quake
                  </button>
                  <button
                    onClick={() => setSelectedPreview('usgs')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      selectedPreview === 'usgs'
                        ? 'bg-cyan-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    USGS Quakes
                  </button>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Sample'}
                </button>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                {getPreviewContent()}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Standards: OGC GeoJSON RFC 7946 &bull; WGS 84 (EPSG:4326)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
