export interface DMHEarthquakeInfo {
  source: string;
  division: string;
  location: string;
  tel: string;
  fax: string;
  officialUrl: string;
  date: string; // '19.10.2026'
  timeMst: string; // '12:59:41'
  timeUtc: string; // '06:29:41 UTC'
  timestamp: number;
  magnitude: number; // 3.7
  magnitudeClassification: string; // 'Slight'
  latitude: number; // 23.38
  longitude: number; // 93.52
  depthKm: number; // 12
  region: string; // 'About (9) miles west of Tedim.'
  township: string; // 'Tedim'
  stateRegion: string; // 'Chin State'
  country: string; // 'Myanmar'
  tectonicContext: string;
  nearestTowns: { name: string; distanceKm: number; direction: string }[];
}

export interface ActiveFaultProperties {
  catalog_id?: string;
  catalog_name?: string;
  slip_type?: string;
  slip_type_formatted?: string;
  length_km?: number;
  tectonic_zone?: string;
  average_dip?: string;
  average_rake?: string;
  net_slip_rate?: string;
  upper_seis_depth?: string;
  lower_seis_depth?: string;
  exposure_quality?: string;
  epistemic_quality?: string;
  activity_confidence?: string;
  name?: string;
  source_db?: string;
  [key: string]: any;
}

export interface ActiveFaultFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
  properties: ActiveFaultProperties;
}

export interface ActiveFaultGeoJSON {
  type: 'FeatureCollection';
  name?: string;
  features: ActiveFaultFeature[];
}

export interface USGSEarthquakeProperties {
  mag: number;
  place: string;
  time: number;
  updated: number;
  tz?: number;
  url: string;
  detail?: string;
  felt?: number | null;
  cdi?: number | null;
  mmi?: number | null;
  alert?: string | null;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst?: number | null;
  dmin?: number | null;
  rms?: number;
  gap?: number;
  magType: string;
  type: string;
  title: string;
}

export interface USGSEarthquakeFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // lon, lat, depth_km
  };
  properties: USGSEarthquakeProperties;
}

export interface USGSGeoJSON {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSEarthquakeFeature[];
}

export type BasemapId = 'esri-satellite' | 'carto-dark' | 'opentopo' | 'carto-voyager';
