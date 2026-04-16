import type { Place } from './types';

type Extras = Partial<Pick<Place, 'telephone' | 'latitude' | 'longitude' | 'openingHours'>>;

/**
 * Optional NAP/geo fields merged into seed places for richer LocalBusiness JSON-LD.
 * Verify phones and coordinates periodically against venue sources.
 */
export const PLACE_LISTING_EXTRAS: Record<string, Extras> = {
  'onecowork-placa-catalunya': {
    telephone: '+34931811818',
    latitude: 41.38702,
    longitude: 2.17009,
  },
  'aticco-glories': {
    latitude: 41.40345,
    longitude: 2.19112,
  },
  'transfolab-bcn': {
    telephone: '+34933080765',
    latitude: 41.40392,
    longitude: 2.19598,
  },
  'tres-punts-gallery': {
    telephone: '+34932176054',
    latitude: 41.40089,
    longitude: 2.15842,
  },
  'house-of-chappaz': {
    telephone: '+34931804271',
    latitude: 41.38142,
    longitude: 2.17789,
  },
  'load-gallery': {
    telephone: '+34934487810',
    latitude: 41.37972,
    longitude: 2.16841,
  },
  'espronceda-institute': {
    telephone: '+34933030762',
    latitude: 41.40358,
    longitude: 2.19441,
  },
  heliogabal: {
    telephone: '+34932178550',
    latitude: 41.40038,
    longitude: 2.15961,
  },
  'les-enfants-brillants': {
    telephone: '+34933197397',
    latitude: 41.38412,
    longitude: 2.18305,
  },
  'el-molino': {
    telephone: '+34934455080',
    latitude: 41.37433,
    longitude: 2.16864,
    openingHours: [
      { dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '20:00', closes: '23:59' },
    ],
  },
  'fab-lab-barcelona': {
    telephone: '+34933207408',
    latitude: 41.40387,
    longitude: 2.19604,
  },
  'disseny-hub': {
    telephone: '+34932565616',
    latitude: 41.40375,
    longitude: 2.18742,
  },
  'ona-restaurant': {
    telephone: '+34931309535',
    latitude: 41.40298,
    longitude: 2.19201,
  },
  'blueproject-foundation': {
    telephone: '+34933106901',
    latitude: 41.38489,
    longitude: 2.18291,
  },
  'nogueras-blanchard': {
    telephone: '+34933108890',
    latitude: 41.38471,
    longitude: 2.18352,
  },
  hangar: {
    telephone: '+34933074110',
    latitude: 41.40312,
    longitude: 2.19485,
  },
};
