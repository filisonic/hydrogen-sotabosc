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
  /** YouTube video / Shorts id — in-page playback */
  youtubeId?: string;
  /** Self-hosted or CDN mp4 when not on Vimeo/YouTube */
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
    'Selected mapping, kinetic, interactive, and fabrication work — play on this page.',
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

/** YouTube embed URL (works for watch + Shorts ids). */
export function labsYouTubeEmbedSrc(youtubeId: string, autoplay = false): string {
  const params = new URLSearchParams({
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
  });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

export const LABS_PROJECTS: LabsProject[] = [
  {
    id: 'ouroboros',
    title: 'Ouroboros',
    category: 'Projection Mapping',
    summary: '3D projection mapping for architectural surfaces.',
    image: '/images/labs/posters/ouroboros.jpg',
    tech: 'Mapping',
    vimeoId: '854473073',
  },
  {
    id: 'kinetic-chaos',
    title: 'Make Kin with Chaos',
    category: 'Kinetic',
    summary: 'Kinetic art with motors and fans — motion as material.',
    image: '/images/labs/posters/kinetic-chaos.jpg',
    tech: 'Kinetic',
    vimeoId: '1107034578',
  },
  {
    id: 'kathakali-mapping',
    title: 'Kathakali — Dushasana Vadham',
    category: 'Projection Mapping',
    summary: 'Projection mapping for Kerala folk performance.',
    image: '/images/labs/posters/kathakali-mapping.jpg',
    tech: 'Mapping',
    vimeoId: '212494211',
  },
  {
    id: 'chasing-the-sun',
    title: 'Chasing the Sun',
    category: 'Projection Mapping',
    summary: 'Meditative projection and time-based light study.',
    image: '/images/labs/posters/chasing-the-sun.jpg',
    tech: 'Light',
    vimeoId: '59516970',
  },
  {
    id: 'y-mapping',
    title: 'Koda & Bijou — There',
    category: 'Projection Mapping',
    summary: '3D projection mapping — Y mapping study for Koda & Bijou.',
    image: '/images/labs/posters/y-mapping.jpg',
    tech: 'Mapping',
    vimeoId: '86099543',
  },
  {
    id: 'mixed-media-portfolio',
    title: 'AR / VR Mixed Media',
    category: 'AR / VR',
    summary: 'Mixed-media portfolio across AR, VR, and spatial experience.',
    image: '/images/labs/posters/mixed-media-portfolio.jpg',
    tech: 'Mixed Reality',
    vimeoId: '1002272149',
  },
  {
    id: 'early-mapping',
    title: 'Early Projection Mapping',
    category: 'Projection Mapping',
    summary: 'Archival mapping study — early practice in light and surface.',
    image: '/images/labs/posters/early-mapping.jpg',
    tech: 'Archive',
    vimeoId: '51797706',
  },
  {
    id: 'plotter',
    title: 'Plotter Drawings',
    category: 'Fabrication',
    summary: 'Generative plotter work — machine drawing as studio practice.',
    image: '/images/labs/posters/plotter.jpg',
    tech: 'Plotter',
    // Streamed from portfolio CDN; plays in-page on Labs (not a case-study hop).
    video: 'https://philipcp.netlify.app/assets/clips/plotter1.mp4',
  },
  {
    id: 'interactive',
    title: 'Interactive Installation',
    category: 'Interactive',
    summary: 'Interactive installation study — presence and response in the room.',
    image: '/images/labs/posters/interactive.jpg',
    tech: 'Interactive',
    youtubeId: '_VRsl7DTcrU',
  },
  {
    id: 'aquarium',
    title: 'Aquarium',
    category: 'Interactive',
    summary: 'Immersive aquarium installation — light, water, and spatial media.',
    image: '/images/labs/posters/aquarium.jpg',
    tech: 'Installation',
    youtubeId: '6hyIGu6FdAE',
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
