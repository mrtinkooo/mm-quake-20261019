import { DMHEarthquakeInfo } from '../types/seismic';

export const DMH_TEDIM_QUAKE: DMHEarthquakeInfo = {
  source: 'Department of Meteorology and Hydrology (DMH)',
  division: 'Seismological Division',
  location: 'Nay Pyi Taw, Myanmar',
  tel: '067-3411269',
  fax: '067-3411253',
  officialUrl: 'https://www.moezala.gov.mm/',
  date: '19.10.2026',
  timeMst: '12:59:41',
  timeUtc: '06:29:41 UTC',
  timestamp: new Date('2026-10-19T06:29:41Z').getTime(),
  magnitude: 3.7,
  magnitudeClassification: 'Slight',
  latitude: 23.38,
  longitude: 93.52,
  depthKm: 12,
  region: 'About (9) miles west of Tedim.',
  township: 'Tedim',
  stateRegion: 'Chin State',
  country: 'Myanmar',
  tectonicContext:
    'Located in the Indo-Burman Range (Chin Hills), near the active deformation front where the Indian Plate subducts obliquely beneath the Burma Plate. The epicenter sits in the accretionary fold-and-thrust wedge between the Kabaw Fault and the Churachandpur-Mao Fault zone.',
  nearestTowns: [
    { name: 'Tedim (Chin State, Myanmar)', distanceKm: 14.5, direction: 'E' },
    { name: 'Champhai (Mizoram, India)', distanceKm: 26.2, direction: 'NW' },
    { name: 'Falam (Chin State, Myanmar)', distanceKm: 46.8, direction: 'SSE' },
    { name: 'Kalewa (Sagaing, Myanmar)', distanceKm: 72.1, direction: 'ESE' },
    { name: 'Hakha (Chin State Capital)', distanceKm: 86.4, direction: 'S' },
    { name: 'Churachandpur (Manipur, India)', distanceKm: 110.0, direction: 'NNE' },
    { name: 'Nay Pyi Taw (DMH HQ)', distanceKm: 395.0, direction: 'SE' }
  ]
};

export const DMH_SEISMIC_SCALE_INFO = [
  { range: '< 3.0', label: 'Micro', description: 'Generally not felt by people' },
  { range: '3.0 - 3.9', label: 'Slight', description: 'Felt by few people indoors; hanging objects swing (Tedim quake: 3.7)' },
  { range: '4.0 - 4.9', label: 'Moderate', description: 'Felt by many indoors, dishes/windows rattle' },
  { range: '5.0 - 5.9', label: 'Rather Strong', description: 'Felt by everyone, slight damage to poorly built structures' },
  { range: '6.0 - 6.9', label: 'Strong', description: 'Considerable damage in ordinary buildings, masonry cracked' },
  { range: '7.0 - 7.9', label: 'Major', description: 'Heavy damage, widespread ground cracking (e.g. 1930 Bago M7.3)' },
  { range: '>= 8.0', label: 'Great', description: 'Catastrophic destruction across regional areas' }
];
