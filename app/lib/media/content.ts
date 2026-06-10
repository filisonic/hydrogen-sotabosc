export type MediaService = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Optional subtle cross-link (e.g. Automatico for digital builds). */
  link?: {label: string; href: string; external?: boolean};
};

export type MediaProcessStep = {
  index: string;
  title: string;
  description: string;
};

export type MediaProject = {
  id: string;
  title: string;
  category: string;
  summary?: string;
  /** Poster / fallback still. */
  image: string;
  /** Optional preview clip (hosted on portfolio CDN). */
  video?: string;
  url: string;
  external?: boolean;
};

export type MediaPageContent = {
  hero: {
    headline: string;
    subhead: string;
    image: string;
    showreelVideo?: string;
  };
  marquee: string[];
  workSection: {
    label: string;
    intro: string;
    linkLabel: string;
    linkHref: string;
    external?: boolean;
  };
  servicesSection: {
    label: string;
    intro: string;
  };
  processSection: {
    label: string;
    intro: string;
  };
  cta: {
    tag: string;
    heading: string;
    body: string;
    buttonLabel: string;
    href: string;
  };
};

const PORTFOLIO_BASE = 'https://philipcp.netlify.app';

/** Portfolio clip paths — served from philipcp.netlify.app public assets. */
function portfolioClip(filename: string): string {
  return `${PORTFOLIO_BASE}/assets/clips/${encodeURIComponent(filename)}`;
}

export const MEDIA_PAGE: MediaPageContent = {
  hero: {
    headline: 'We make brands make sense',
    subhead:
      'Brand direction, creative strategy, and media production for people building something real — projection mapping, animation, and installation work.',
    image: '/images/media/posters/ouroboros-projection-mapping.jpg',
    showreelVideo: portfolioClip('Ouroboros.mp4'),
  },
  marquee: [
    'Projection Mapping',
    'Animation',
    'Installation',
    'Brand Direction',
    'Creative Strategy',
    'Barcelona',
    'Studio',
  ],
  workSection: {
    label: 'Mapping & animation',
    intro:
      'A sample of projection and animation work — click any piece to open the full case study on the portfolio.',
    linkLabel: 'Full portfolio',
    linkHref: `${PORTFOLIO_BASE}/work`,
    external: true,
  },
  servicesSection: {
    label: 'What we do',
    intro:
      'Three ways we help — from the story you tell to the things people see, share, and remember.',
  },
  processSection: {
    label: 'How we work',
    intro:
      'No pitch decks. No mystery phases. Just a clear path from first conversation to finished work.',
  },
  cta: {
    tag: 'Start here',
    heading: 'Book a conversation',
    body:
      'Tell us what you are building. We will figure out together whether brand, content, or platform is the right first move.',
    buttonLabel: 'Book a conversation',
    href: '/contact?type=Brand%20%26%20Media',
  },
};

export const MEDIA_SERVICES: MediaService[] = [
  {
    id: 'brand-direction',
    title: 'Brand Direction',
    tagline: 'Strategy, identity, positioning',
    description:
      'Clarify who you are, who you are for, and how you show up — before anyone opens a design file.',
    tags: ['Strategy', 'Identity', 'Positioning', 'Voice'],
  },
  {
    id: 'creative-production',
    title: 'Creative Production',
    tagline: 'Video, photo, content',
    description:
      'Campaigns, films, motion, and installation work — from music videos and documentaries to projection mapping.',
    tags: ['Film', 'Motion', 'Installations', 'Campaigns'],
  },
  {
    id: 'digital-presence',
    title: 'Digital Presence',
    tagline: 'Websites, platforms, systems',
    description:
      'Sites, pipelines, and reusable creative systems that carry the brand into daily use.',
    tags: ['Websites', 'Pipelines', 'AI-assisted production'],
    link: {
      label: 'Built with Automatico',
      href: 'https://automatico.studio',
      external: true,
    },
  },
];

export const MEDIA_PROCESS: MediaProcessStep[] = [
  {
    index: '01',
    title: 'Discovery',
    description:
      'We listen — goals, audience, constraints, and what already works. No assumptions.',
  },
  {
    index: '02',
    title: 'Direction',
    description:
      'Strategy and creative frame agreed before production. You know what we are making and why.',
  },
  {
    index: '03',
    title: 'Delivery',
    description:
      'Finished assets, documented systems, and a handoff you can actually use.',
  },
];

/** Mapping + animation only — videos from philipcp.netlify.app, links open portfolio case studies. */
export const MEDIA_PROJECTS: MediaProject[] = [
  {
    id: 'ouroboros',
    title: 'Ouroboros',
    category: 'Projection Mapping',
    summary: '3D projection mapping for architectural surfaces',
    image: '/images/media/posters/ouroboros-projection-mapping.jpg',
    video: portfolioClip('Ouroboros.mp4'),
    url: `${PORTFOLIO_BASE}/work/ouroboros-projection-mapping`,
    external: true,
  },
  {
    id: 'chasing-the-sun',
    title: 'Chasing the Sun',
    category: 'Projection Mapping',
    summary: 'Meditative projection and time-based light study',
    image: '/images/media/posters/chasing-the-sun.jpg',
    video: portfolioClip('Projection-Mapping-MashiBhootham.mp4'),
    url: `${PORTFOLIO_BASE}/work/chasing-the-sun`,
    external: true,
  },
  {
    id: 'punarjanani',
    title: 'Punarjanani (Rebirth)',
    category: 'Animation',
    summary: 'Animation and research on ecological regeneration',
    image: '/images/media/posters/punarjanani-rebirth.jpg',
    url: `${PORTFOLIO_BASE}/work/punarjanani-rebirth`,
    external: true,
  },
  {
    id: 'puppet-doc-trailer',
    title: 'Puppet Documentary Trailer',
    category: 'Animation',
    summary: 'Handcrafted worlds and character-led storytelling',
    image: '/images/media/posters/puppet-doc-trailer.jpg',
    video: portfolioClip('Kathputli Puppets Documentary Teaser Trailer_1080p.mp4'),
    url: `${PORTFOLIO_BASE}/work/puppet-doc-trailer`,
    external: true,
  },
];

export function getMediaPageContent(): MediaPageContent {
  return MEDIA_PAGE;
}

export function getMediaServices(): MediaService[] {
  return MEDIA_SERVICES;
}

export function getMediaProcess(): MediaProcessStep[] {
  return MEDIA_PROCESS;
}

export function getMediaProjects(): MediaProject[] {
  return MEDIA_PROJECTS;
}
