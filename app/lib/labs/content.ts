export type LabsCapability = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export type LabsProject = {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  tech?: string;
  /** Vimeo numeric id — preferred in-page playback */
  vimeoId?: string;
  /** Self-hosted clip under /videos/labs/ when not on Vimeo */
  video?: string;
  href?: string | null;
  external?: boolean;
};

export type LabsPageContent = {
  hero: {
    meta: string;
    titleLines: [string, string, string];
    description: string;
  };
  marquee: string[];
  capabilitiesIntro: string;
  projectsIntro: string;
  utilityLabel: string;
};

export const LABS_PAGE: LabsPageContent = {
  hero: {
    meta: 'Sotabosc · Interactive Studio',
    titleLines: ['Labs', 'Interactive', 'Practice'],
    description:
      'Mapping, kinetic sculpture, interactive installation, and making — light, space, and physical form. Watch the work here.',
  },
  marquee: [
    'Projection Mapping',
    'Kinetic',
    'Interactive',
    'AR / VR',
    'Displays',
    '3D Printing',
    'Plotters',
    'Live Caricature',
    'Barcelona',
  ],
  capabilitiesIntro:
    'Studio specialties across digital surfaces, physical making, and live presence.',
  projectsIntro:
    'Selected mapping, kinetic, and mixed-media work — play on this page. Plotter, aquarium, and other pieces not yet on Vimeo can be added as files land.',
  utilityLabel: 'Studio practice',
};

export const LABS_CAPABILITIES: LabsCapability[] = [
  {
    id: 'mapping',
    title: 'Projection Mapping',
    description:
      'Architectural and object mapping — depth-aware projection, real-time graphics, and site-specific light narratives.',
    tags: ['TouchDesigner', 'Kinect', 'Architecture', 'Real-time'],
  },
  {
    id: 'kinetic',
    title: 'Kinetic & Motor Systems',
    description:
      'Moving sculpture and fan-driven chaos — physical motion as the medium, not only the screen.',
    tags: ['Motors', 'Fans', 'Installation'],
  },
  {
    id: 'interactive',
    title: 'Interactive & Mixed Reality',
    description:
      'Gesture, proximity, AR/VR, and presence-driven experiences that turn rooms and objects into responsive interfaces.',
    tags: ['Spatial Computing', 'AR/VR', 'Sensors'],
  },
  {
    id: 'displays',
    title: 'Displays & Spatial Media',
    description:
      'LED, projection, and hybrid display systems for museums, events, and branded environments.',
    tags: ['LED', 'Scenography', 'Content Systems'],
  },
  {
    id: 'fabrication',
    title: '3D Printing & Plotters',
    description:
      'Physical making for props, reliefs, and generative drawings — bridging digital form and material output.',
    tags: ['3D Print', 'Plotter', 'Fabrication'],
  },
  {
    id: 'live',
    title: 'Live Caricature & Presence',
    description:
      'Live drawing and caricature for events — fast, public-facing making that meets audiences in the room.',
    tags: ['Live', 'Events', 'Illustration'],
  },
];

/** Vimeo embed URL for a numeric id. */
export function labsVimeoEmbedSrc(vimeoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1',
  });
  if (autoplay) params.set('autoplay', '1');
  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
}

export const LABS_PROJECTS: LabsProject[] = [
  {
    id: 'ouroboros',
    title: 'Ouroboros',
    category: 'Projection Mapping',
    summary: '3D projection mapping for architectural surfaces.',
    image: '/images/media/posters/ouroboros-projection-mapping.jpg',
    tech: 'Mapping',
    vimeoId: '854473073',
  },
  {
    id: 'kinetic-chaos',
    title: 'Make Kin with Chaos',
    category: 'Kinetic',
    summary: 'Kinetic art with motors and fans — motion as material.',
    image: '/images/labs/labs-image.jpg',
    tech: 'Kinetic',
    vimeoId: '1107034578',
  },
  {
    id: 'kathakali-mapping',
    title: 'Kathakali — Dushasana Vadham',
    category: 'Projection Mapping',
    summary: 'Projection mapping for Kerala folk performance.',
    image: '/images/labs/jakub-zerdzicki-oG3rjdcSnEU-unsplash.jpg',
    tech: 'Mapping',
    vimeoId: '212494211',
  },
  {
    id: 'chasing-the-sun',
    title: 'Chasing the Sun',
    category: 'Projection Mapping',
    summary: 'Meditative projection and time-based light study.',
    image: '/images/media/posters/chasing-the-sun.jpg',
    tech: 'Light',
    vimeoId: '59516970',
  },
  {
    id: 'y-mapping',
    title: 'Koda & Bijou — There',
    category: 'Projection Mapping',
    summary: '3D projection mapping — Y mapping study for Koda & Bijou.',
    image: '/images/media/posters/koda-bijou-there.jpg',
    tech: 'Mapping',
    vimeoId: '86099543',
  },
  {
    id: 'mixed-media-portfolio',
    title: 'AR / VR Mixed Media',
    category: 'AR / VR',
    summary: 'Mixed-media portfolio across AR, VR, and spatial experience.',
    image: '/images/labs/vishnu-mohanan-eaDwf4UAEhk-unsplash.jpg',
    tech: 'Mixed Reality',
    vimeoId: '1002272149',
  },
  {
    id: 'early-mapping',
    title: 'Early Projection Mapping',
    category: 'Projection Mapping',
    summary: 'Archival mapping study — early practice in light and surface.',
    image: '/images/labs/laurens-van-der-drift-iv2-3AeAO-A-unsplash.jpg',
    tech: 'Archive',
    vimeoId: '51797706',
  },
];

export function getLabsPageContent(): LabsPageContent {
  return LABS_PAGE;
}

export function getLabsCapabilities(): LabsCapability[] {
  return LABS_CAPABILITIES;
}

export function getLabsProjects(): LabsProject[] {
  return LABS_PROJECTS;
}
