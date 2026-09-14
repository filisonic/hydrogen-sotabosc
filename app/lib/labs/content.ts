const PORTFOLIO_BASE = 'https://philipcp.netlify.app';

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
      'Mapping, interactive installation, displays, and making — light, space, and physical form for brands, culture, and live audiences.',
  },
  marquee: [
    'Projection Mapping',
    'Interactive',
    'Displays',
    '3D Printing',
    'Plotters',
    'Live Caricature',
    'Spatial Design',
    'Barcelona',
  ],
  capabilitiesIntro:
    'Studio specialties across digital surfaces, physical making, and live presence.',
  projectsIntro:
    'Selected mapping and interactive work. Fabrication and live practice listed as capabilities — case studies added as assets land.',
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
    id: 'interactive',
    title: 'Interactive Installation',
    description:
      'Gesture, proximity, and presence-driven experiences that turn rooms and objects into responsive interfaces.',
    tags: ['Spatial Computing', 'Sensors', 'Installation'],
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

export const LABS_PROJECTS: LabsProject[] = [
  {
    id: 'ouroboros',
    title: 'Ouroboros',
    category: 'Projection Mapping',
    summary: '3D projection mapping for architectural surfaces.',
    image: '/images/media/posters/ouroboros-projection-mapping.jpg',
    tech: 'Mapping',
    href: `${PORTFOLIO_BASE}/work/ouroboros-projection-mapping`,
    external: true,
  },
  {
    id: 'chasing-the-sun',
    title: 'Chasing the Sun',
    category: 'Projection Mapping',
    summary: 'Meditative projection and time-based light study.',
    image: '/images/media/posters/chasing-the-sun.jpg',
    tech: 'Light',
    href: `${PORTFOLIO_BASE}/work/chasing-the-sun`,
    external: true,
  },
  {
    id: 'depth-projection',
    title: 'Depth-Sensing Projection',
    category: 'Interactive',
    summary:
      'Real-time depth-sensing projection onto physical objects using Kinect and TouchDesigner.',
    image: '/images/labs/labs-image.jpg',
    tech: 'TouchDesigner',
    href: '/contact?type=Interactive%20%26%20Labs',
    external: false,
  },
  {
    id: 'spatial-displays',
    title: 'Spatial Display Studies',
    category: 'Displays',
    summary:
      'Explorations in layered light, surface, and environmental media for immersive rooms.',
    image: '/images/labs/vishnu-mohanan-eaDwf4UAEhk-unsplash.jpg',
    tech: 'Spatial',
    href: '/contact?type=Interactive%20%26%20Labs',
    external: false,
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
