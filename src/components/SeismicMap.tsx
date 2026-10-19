import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ActiveFaultFeature, ActiveFaultGeoJSON, BasemapId, DMHEarthquakeInfo, USGSEarthquakeFeature, USGSGeoJSON } from '../types/seismic';
import { getDepthColor, getFaultColor, haversineDistance } from '../utils/geoUtils';

interface SeismicMapProps {
  dmhQuake: DMHEarthquakeInfo;
  faultsData: ActiveFaultGeoJSON | null;
  usgsData: USGSGeoJSON | null;
  basemap: BasemapId;
  showFaults: boolean;
  showUSGS: boolean;
  showDMH: boolean;
  selectedSlipType: string;
  minMagnitude: number;
  selectedFault: ActiveFaultFeature | null;
  onSelectFault: (fault: ActiveFaultFeature | null) => void;
  selectedQuake: USGSEarthquakeFeature | null;
  onSelectQuake: (quake: USGSEarthquakeFeature | null) => void;
  measureMode: boolean;
  onMeasurePoint?: (point: { lat: number; lng: number } | null) => void;
  centerTarget: { lat: number; lng: number; zoom?: number } | null;
}

export const SeismicMap: React.FC<SeismicMapProps> = ({
  dmhQuake,
  faultsData,
  usgsData,
  basemap,
  showFaults,
  showUSGS,
  showDMH,
  selectedSlipType,
  minMagnitude,
  selectedFault,
  onSelectFault,
  selectedQuake,
  onSelectQuake,
  measureMode,
  onMeasurePoint,
  centerTarget
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const faultsLayerRef = useRef<L.GeoJSON | null>(null);
  const usgsLayerRef = useRef<L.LayerGroup | null>(null);
  const dmhMarkerRef = useRef<L.Marker | null>(null);
  const measureMarkerRef = useRef<L.CircleMarker | null>(null);
  const measureLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.9, 95.9], // Center of Myanmar
      zoom: 6,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: true, metric: true, position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a>';

    if (basemap === 'esri-satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (basemap === 'opentopo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
    } else if (basemap === 'carto-voyager') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    }

    const tileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [basemap]);

  // Center / fly to target if requested
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centerTarget) return;
    map.flyTo([centerTarget.lat, centerTarget.lng], centerTarget.zoom || 9, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }, [centerTarget]);

  // Render DMH Extracted Quake Epicenter Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (dmhMarkerRef.current) {
      map.removeLayer(dmhMarkerRef.current);
      dmhMarkerRef.current = null;
    }

    if (!showDMH) return;

    // Custom pulsing epicentral HTML icon
    const customIcon = L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="seismic-pulse-ring"></div>
          <div class="seismic-pulse-ring-delayed"></div>
          <div class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center z-10 transition-transform hover:scale-125 cursor-pointer">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    const marker = L.marker([dmhQuake.latitude, dmhQuake.longitude], {
      icon: customIcon,
      zIndexOffset: 1000
    }).addTo(map);

    const popupHtml = `
      <div class="p-3 text-xs min-w-[240px]">
        <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-500/30">
          <span class="inline-flex items-center gap-1 font-bold text-rose-400 uppercase tracking-wider text-[11px]">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            DMH Official Bulletin
          </span>
          <span class="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">
            M ${dmhQuake.magnitude.toFixed(1)} ${dmhQuake.magnitudeClassification}
          </span>
        </div>
        <div class="space-y-1 font-mono text-slate-300">
          <div class="flex justify-between"><span class="text-slate-400">Date:</span> <span class="text-white font-medium">${dmhQuake.date}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Time (MST):</span> <span class="text-white font-medium">${dmhQuake.timeMst}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Coordinates:</span> <span class="text-white">${dmhQuake.latitude}° N, ${dmhQuake.longitude}° E</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Focal Depth:</span> <span class="text-amber-400 font-semibold">${dmhQuake.depthKm} km</span></div>
          <div class="pt-1 text-slate-200 text-[11px] font-sans border-t border-slate-700/50 mt-1.5">
            <span class="text-slate-400">Region:</span> ${dmhQuake.region}
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    dmhMarkerRef.current = marker;
  }, [dmhQuake, showDMH]);

  // Render GEM Active Faults GeoJSON Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (faultsLayerRef.current) {
      map.removeLayer(faultsLayerRef.current);
      faultsLayerRef.current = null;
    }

    if (!showFaults || !faultsData) return;

    const filteredFeatures = faultsData.features.filter(f => {
      if (selectedSlipType === 'all') return true;
      return f.properties.slip_type === selectedSlipType;
    });

    const geoJsonLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features: filteredFeatures
      } as any,
      {
        style: feature => {
          const isSelected =
            selectedFault &&
            selectedFault.properties.catalog_id === feature?.properties.catalog_id;
          const color = getFaultColor(feature?.properties.slip_type);
          return {
            color: isSelected ? '#38bdf8' : color,
            weight: isSelected ? 4.5 : 2.5,
            opacity: isSelected ? 1.0 : 0.85,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: feature?.properties.slip_type?.toLowerCase().includes('normal')
              ? '6, 4'
              : undefined
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          const color = getFaultColor(props.slip_type);

          layer.on({
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({ weight: 4.5, opacity: 1.0 });
            },
            mouseout: (e: any) => {
              if (
                selectedFault &&
                selectedFault.properties.catalog_id === feature.properties.catalog_id
              ) {
                e.target.setStyle({ weight: 4.5, opacity: 1.0 });
              } else {
                e.target.setStyle({
                  weight: 2.5,
                  opacity: 0.85,
                  color
                });
              }
            },
            click: () => {
              onSelectFault(feature as ActiveFaultFeature);
              onSelectQuake(null);
            }
          });

          // Popup
          const popupContent = `
            <div class="p-3 text-xs min-w-[230px]">
              <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-700">
                <span class="font-bold text-amber-400 text-xs">
                  ${props.name || props.catalog_id || 'Active Fault'}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium" style="background: ${color}25; color: ${color}; border: 1px solid ${color}60;">
                  ${props.slip_type_formatted || props.slip_type || 'Active'}
                </span>
              </div>
              <div class="space-y-1 font-mono text-slate-300 text-[11px]">
                <div class="flex justify-between"><span class="text-slate-400">Database:</span> <span class="text-slate-200">${props.catalog_name || 'GEM GAF-DB'}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Tectonic Zone:</span> <span class="text-slate-200 text-right">${props.tectonic_zone || 'Myanmar'}</span></div>
                ${props.length_km ? `<div class="flex justify-between"><span class="text-slate-400">Trace Length:</span> <span class="text-white font-medium">${props.length_km} km</span></div>` : ''}
                ${props.net_slip_rate ? `<div class="flex justify-between"><span class="text-slate-400">Net Slip Rate:</span> <span class="text-cyan-300 font-medium">${props.net_slip_rate} mm/yr</span></div>` : ''}
                ${props.average_dip ? `<div class="flex justify-between"><span class="text-slate-400">Dip / Direction:</span> <span class="text-slate-200">${props.average_dip}° ${props.dip_dir || ''}</span></div>` : ''}
              </div>
            </div>
          `;
          layer.bindPopup(popupContent);
        }
      }
    ).addTo(map);

    faultsLayerRef.current = geoJsonLayer;
  }, [faultsData, showFaults, selectedSlipType, selectedFault, onSelectFault, onSelectQuake]);

  // Render USGS Earthquakes Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (usgsLayerRef.current) {
      map.removeLayer(usgsLayerRef.current);
      usgsLayerRef.current = null;
    }

    if (!showUSGS || !usgsData) return;

    const layerGroup = L.layerGroup();

    const filteredQuakes = usgsData.features.filter(
      f => f.properties.mag >= minMagnitude
    );

    filteredQuakes.forEach(quake => {
      const coords = quake.geometry.coordinates;
      const lon = coords[0];
      const lat = coords[1];
      const depth = coords[2] ?? 10;
      const mag = quake.properties.mag;

      const radius = Math.max(4, (mag - 2.5) * 3.5);
      const depthColor = getDepthColor(depth);

      const circle = L.circleMarker([lat, lon], {
        radius,
        fillColor: depthColor,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75
      });

      circle.on('click', () => {
        onSelectQuake(quake);
        onSelectFault(null);
      });

      const dateStr = new Date(quake.properties.time).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Yangon'
      });

      const popupContent = `
        <div class="p-3 text-xs min-w-[230px]">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-700">
            <span class="font-bold text-white text-xs">M ${mag.toFixed(1)}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium" style="background: ${depthColor}25; color: ${depthColor}; border: 1px solid ${depthColor}60;">
              Depth: ${depth.toFixed(1)} km
            </span>
          </div>
          <div class="space-y-1 font-mono text-slate-300 text-[11px]">
            <div class="text-slate-200 font-sans pb-1">${quake.properties.place}</div>
            <div class="flex justify-between"><span class="text-slate-400">Time (MMT):</span> <span class="text-white">${dateStr}</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Coords:</span> <span class="text-slate-300">${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</span></div>
            ${quake.properties.url ? `<div class="pt-1.5 text-right"><a href="${quake.properties.url}" target="_blank" rel="noreferrer" class="text-rose-400 hover:underline text-[10px] inline-flex items-center gap-1">USGS Event Details &rarr;</a></div>` : ''}
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      layerGroup.addLayer(circle);
    });

    layerGroup.addTo(map);
    usgsLayerRef.current = layerGroup;
  }, [usgsData, showUSGS, minMagnitude, onSelectQuake, onSelectFault]);

  // Handle Map Click for Measurement Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!measureMode) return;

      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;

      if (onMeasurePoint) {
        onMeasurePoint({ lat: clickLat, lng: clickLng });
      }

      // Draw line and pin from DMH epicenter to clicked point
      if (measureMarkerRef.current) {
        map.removeLayer(measureMarkerRef.current);
      }
      if (measureLineRef.current) {
        map.removeLayer(measureLineRef.current);
      }

      const dist = haversineDistance(dmhQuake.latitude, dmhQuake.longitude, clickLat, clickLng);

      const marker = L.circleMarker([clickLat, clickLng], {
        radius: 6,
        fillColor: '#38bdf8',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2 text-xs">
          <div class="font-bold text-sky-400">Measured Point</div>
          <div class="text-slate-300">${clickLat.toFixed(4)}° N, ${clickLng.toFixed(4)}° E</div>
          <div class="mt-1 font-mono text-emerald-400 font-semibold">Distance to Tedim Quake: ${dist} km</div>
        </div>
      `).openPopup();

      const polyline = L.polyline(
        [
          [dmhQuake.latitude, dmhQuake.longitude],
          [clickLat, clickLng]
        ],
        {
          color: '#38bdf8',
          weight: 2.5,
          dashArray: '5, 5',
          opacity: 0.9
        }
      ).addTo(map);

      measureMarkerRef.current = marker;
      measureLineRef.current = polyline;
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [measureMode, dmhQuake, onMeasurePoint]);

  // Clean measurement line if measureMode toggled off
  useEffect(() => {
    const map = mapRef.current;
    if (!map || measureMode) return;

    if (measureMarkerRef.current) {
      map.removeLayer(measureMarkerRef.current);
      measureMarkerRef.current = null;
    }
    if (measureLineRef.current) {
      map.removeLayer(measureLineRef.current);
      measureLineRef.current = null;
    }
  }, [measureMode]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />
    </div>
  );
};
